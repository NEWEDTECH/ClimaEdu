import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  DocumentData,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { LessonProgress } from '../../../core/entities/LessonProgress';
import { ContentProgress } from '../../../core/entities/ContentProgress';
import { LessonProgressStatus, ContentProgressStatus } from '../../../core/entities/ProgressStatus';
import type { LessonProgressRepository } from '../LessonProgressRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the LessonProgressRepository
 */
@injectable()
export class FirebaseLessonProgressRepository implements LessonProgressRepository {
  private readonly collectionName = 'lesson_progresses';
  private readonly idPrefix = 'lp_';
  
  // Identity Map for caching lesson progress entities
  private readonly identityMap = new Map<string, LessonProgress>();
  private readonly cacheTimestamps = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

  /**
   * Generate a new unique ID for a lesson progress
   * @returns A unique ID with the lesson progress prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Generate cache key for identity map
   * @param userId User ID
   * @param lessonId Lesson ID
   * @returns Cache key
   */
  private getCacheKey(userId: string, lessonId: string): string {
    return `${userId}:${lessonId}`;
  }

  /**
   * Check if cached entry is still valid (not expired)
   * @param key Cache key
   * @returns true if valid, false if expired
   */
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    
    return (Date.now() - timestamp) < this.CACHE_TTL;
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if ((now - timestamp) >= this.CACHE_TTL) {
        this.identityMap.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  /**
   * Store entity in identity map cache
   * @param entity LessonProgress entity to cache
   */
  private cacheEntity(entity: LessonProgress): void {
    const key = this.getCacheKey(entity.userId, entity.lessonId);
    this.identityMap.set(key, entity);
    this.cacheTimestamps.set(key, Date.now());
    
    // Periodically clean expired cache
    if (Math.random() < 0.1) { // 10% chance on each cache operation
      this.clearExpiredCache();
    }
  }

  /**
   * Private method to convert Firestore Timestamp to Date
   * @param timestamp Firestore Timestamp or null
   * @returns Date or null
   */
  private timestampToDate(timestamp: Timestamp | null): Date | null {
    return timestamp ? timestamp.toDate() : null;
  }

  /**
   * Private method to convert Date to Firestore Timestamp
   * @param date Date or null
   * @returns Firestore Timestamp or null
   */
  private dateToTimestamp(date: Date | null): Timestamp | null {
    return date ? Timestamp.fromDate(date) : null;
  }

  /**
   * Private adapter method to convert Firestore document data to a LessonProgress entity
   * @param data Firestore document data
   * @returns LessonProgress entity
   */
  private mapToEntity(data: DocumentData): LessonProgress {
    // Map content progresses from Firestore data
    const contentProgresses = (data.contentProgresses || []).map((cp: DocumentData) => 
      ContentProgress.create({
        contentId: cp.contentId,
        status: cp.status as ContentProgressStatus,
        progressPercentage: cp.progressPercentage,
        timeSpent: cp.timeSpent,
        startedAt: this.timestampToDate(cp.startedAt) || new Date(),
        completedAt: this.timestampToDate(cp.completedAt),
        lastPosition: cp.lastPosition,
        updatedAt: this.timestampToDate(cp.updatedAt) || new Date()
      })
    );

    // Extract content IDs for the create method
    const contentIds = contentProgresses.map((cp: ContentProgress) => cp.contentId);

    return LessonProgress.create({
      id: data.id,
      userId: data.userId,
      lessonId: data.lessonId,
      institutionId: data.institutionId,
      contentIds,
      status: data.status as LessonProgressStatus,
      startedAt: this.timestampToDate(data.startedAt) || new Date(),
      completedAt: this.timestampToDate(data.completedAt),
      lastAccessedAt: this.timestampToDate(data.lastAccessedAt) || new Date(),
      contentProgresses,
      updatedAt: this.timestampToDate(data.updatedAt) || new Date()
    });
  }

  /**
   * Private method to convert LessonProgress entity to Firestore document data
   * @param lessonProgress LessonProgress entity
   * @returns Firestore document data
   */
  private mapToFirestoreData(lessonProgress: LessonProgress): DocumentData {
    return {
      id: lessonProgress.id,
      userId: lessonProgress.userId,
      lessonId: lessonProgress.lessonId,
      institutionId: lessonProgress.institutionId,
      status: lessonProgress.status,
      startedAt: this.dateToTimestamp(lessonProgress.startedAt),
      completedAt: this.dateToTimestamp(lessonProgress.completedAt),
      lastAccessedAt: this.dateToTimestamp(lessonProgress.lastAccessedAt),
      updatedAt: this.dateToTimestamp(lessonProgress.updatedAt),
      contentProgresses: lessonProgress.contentProgresses.map(cp => ({
        contentId: cp.contentId,
        status: cp.status,
        progressPercentage: cp.progressPercentage,
        timeSpent: cp.timeSpent,
        startedAt: this.dateToTimestamp(cp.startedAt),
        completedAt: this.dateToTimestamp(cp.completedAt),
        lastPosition: cp.lastPosition,
        updatedAt: this.dateToTimestamp(cp.updatedAt)
      }))
    };
  }

  /**
   * Find lesson progress by user and lesson (with Identity Map caching)
   * @param userId User ID
   * @param lessonId Lesson ID
   * @returns LessonProgress or null if not found
   */
  async findByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const cacheKey = this.getCacheKey(userId, lessonId);
    
    // Check identity map cache first
    if (this.identityMap.has(cacheKey) && this.isCacheValid(cacheKey)) {
      console.log(`Identity Map: Cache hit for ${cacheKey}`);
      return this.identityMap.get(cacheKey)!;
    }
    
    console.log(`Identity Map: Cache miss for ${cacheKey}, fetching from database`);
    
    // Fetch from database
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('lessonId', '==', lessonId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const entity = this.mapToEntity({ id: doc.id, ...data });
    
    // Cache the entity in identity map
    this.cacheEntity(entity);
    
    return entity;
  }

  /**
   * Find all lesson progresses for a specific user
   * @param userId User ID
   * @returns Array of LessonProgress
   */
  async findByUser(userId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(progressRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find all lesson progresses for a specific user within an institution
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns Array of LessonProgress
   */
  async findByUserAndInstitution(userId: string, institutionId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find all lesson progresses for a specific lesson
   * @param lessonId Lesson ID
   * @returns Array of LessonProgress
   */
  async findByLesson(lessonId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(progressRef, where('lessonId', '==', lessonId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find all lesson progresses for a specific lesson within an institution
   * @param lessonId Lesson ID
   * @param institutionId Institution ID
   * @returns Array of LessonProgress
   */
  async findByLessonAndInstitution(lessonId: string, institutionId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('lessonId', '==', lessonId),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find all lesson progresses within an institution
   * @param institutionId Institution ID
   * @returns Array of LessonProgress
   */
  async findByInstitution(institutionId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(progressRef, where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find completed lesson progresses for a user
   * @param userId User ID
   * @returns Array of completed LessonProgress
   */
  async findCompletedByUser(userId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('status', '==', LessonProgressStatus.COMPLETED)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find in-progress lesson progresses for a user
   * @param userId User ID
   * @returns Array of in-progress LessonProgress
   */
  async findInProgressByUser(userId: string): Promise<LessonProgress[]> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('status', '==', LessonProgressStatus.IN_PROGRESS)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Save a lesson progress (with Identity Map cache update)
   * @param lessonProgress LessonProgress to save
   * @returns Saved LessonProgress
   */
  async save(lessonProgress: LessonProgress): Promise<LessonProgress> {
    const progressRef = doc(firestore, this.collectionName, lessonProgress.id);
    const progressData = this.mapToFirestoreData(lessonProgress);

    console.log(`Identity Map: Saving lesson progress ${lessonProgress.id} with status: ${lessonProgress.status}`);
    
    await setDoc(progressRef, progressData, { merge: true });

    // Update the identity map cache with the saved entity
    this.cacheEntity(lessonProgress);
    
    console.log(`Identity Map: Cached updated entity for ${this.getCacheKey(lessonProgress.userId, lessonProgress.lessonId)}`);

    return lessonProgress;
  }

  /**
   * Clear identity map cache for a specific user and lesson
   * @param userId User ID
   * @param lessonId Lesson ID
   */
  clearCache(userId: string, lessonId: string): void {
    const cacheKey = this.getCacheKey(userId, lessonId);
    this.identityMap.delete(cacheKey);
    this.cacheTimestamps.delete(cacheKey);
    console.log(`Identity Map: Cleared cache for ${cacheKey}`);
  }

  /**
   * Clear all identity map cache
   */
  clearAllCache(): void {
    this.identityMap.clear();
    this.cacheTimestamps.clear();
    console.log('Identity Map: Cleared all cache');
  }

  /**
   * Delete a lesson progress
   * @param id LessonProgress ID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const progressRef = doc(firestore, this.collectionName, id);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return false;
    }

    await deleteDoc(progressRef);
    return true;
  }

  /**
   * Check if a lesson progress exists for a user and lesson
   * @param userId User ID
   * @param lessonId Lesson ID
   * @returns true if exists, false otherwise
   */
  async exists(userId: string, lessonId: string): Promise<boolean> {
    const progress = await this.findByUserAndLesson(userId, lessonId);
    return progress !== null;
  }

  /**
   * Count total lesson progresses for a user
   * @param userId User ID
   * @returns Number of lesson progresses
   */
  async countByUser(userId: string): Promise<number> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(progressRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  /**
   * Count completed lesson progresses for a user
   * @param userId User ID
   * @returns Number of completed lesson progresses
   */
  async countCompletedByUser(userId: string): Promise<number> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('status', '==', LessonProgressStatus.COMPLETED)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  /**
   * Count lesson progresses for a lesson
   * @param lessonId Lesson ID
   * @returns Number of lesson progresses
   */
  async countByLesson(lessonId: string): Promise<number> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(progressRef, where('lessonId', '==', lessonId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  /**
   * Count completed lesson progresses for a lesson
   * @param lessonId Lesson ID
   * @returns Number of completed lesson progresses
   */
  async countCompletedByLesson(lessonId: string): Promise<number> {
    const progressRef = collection(firestore, this.collectionName);
    const q = query(
      progressRef,
      where('lessonId', '==', lessonId),
      where('status', '==', LessonProgressStatus.COMPLETED)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }
}
