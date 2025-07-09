import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  DocumentData, 
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { PodcastView } from '../../../core/entities/PodcastView';
import type { 
  PodcastViewRepository, 
  AnalyticsTimeRange, 
  ViewsOverTime, 
  PaginationOptions 
} from '../PodcastViewRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the PodcastViewRepository
 */
@injectable()
export class FirebasePodcastViewRepository implements PodcastViewRepository {
  private readonly collectionName = 'podcast_views';
  private readonly idPrefix = 'podv_';

  /**
   * Generate a new unique ID for a podcast view
   * @returns A unique ID with the podcast view prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a PodcastView entity
   * @param data Firestore document data
   * @returns PodcastView entity
   */
  private mapToEntity(data: DocumentData): PodcastView {
    // Convert Firestore timestamps to Date objects
    const viewedAt = data.viewedAt instanceof Timestamp 
      ? data.viewedAt.toDate() 
      : new Date(data.viewedAt);
    
    // Create and return a PodcastView entity
    return PodcastView.create({
      id: data.id,
      podcastId: data.podcastId,
      userId: data.userId,
      institutionId: data.institutionId,
      viewedAt
    });
  }

  /**
   * Save a podcast view
   * @param view PodcastView to save
   * @returns Saved podcast view
   */
  async save(view: PodcastView): Promise<PodcastView> {
    const viewRef = doc(firestore, this.collectionName, view.id);
    
    // Prepare the view data for Firestore
    const viewData = {
      id: view.id,
      podcastId: view.podcastId,
      userId: view.userId,
      institutionId: view.institutionId,
      viewedAt: view.viewedAt
    };

    await setDoc(viewRef, viewData);
    return view;
  }

  /**
   * Find a podcast view by id
   * @param id PodcastView id
   * @returns PodcastView or null if not found
   */
  async findById(id: string): Promise<PodcastView | null> {
    const viewRef = doc(firestore, this.collectionName, id);
    const viewDoc = await getDoc(viewRef);

    if (!viewDoc.exists()) {
      return null;
    }

    const data = viewDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Count total views for a podcast
   * @param podcastId Podcast id
   * @returns Total number of views
   */
  async countByPodcastId(podcastId: string): Promise<number> {
    const viewsRef = collection(firestore, this.collectionName);
    const q = query(viewsRef, where('podcastId', '==', podcastId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  /**
   * Count unique viewers for a podcast
   * @param podcastId Podcast id
   * @returns Number of unique viewers
   */
  async countUniqueViewersByPodcastId(podcastId: string): Promise<number> {
    const viewsRef = collection(firestore, this.collectionName);
    const q = query(viewsRef, where('podcastId', '==', podcastId));
    const querySnapshot = await getDocs(q);
    
    // Get unique user IDs
    const uniqueUserIds = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      uniqueUserIds.add(data.userId);
    });
    
    return uniqueUserIds.size;
  }

  /**
   * Find a view by user and podcast
   * @param userId User id
   * @param podcastId Podcast id
   * @returns Most recent view or null if not found
   */
  async findByUserAndPodcast(userId: string, podcastId: string): Promise<PodcastView | null> {
    const viewsRef = collection(firestore, this.collectionName);
    const q = query(
      viewsRef, 
      where('userId', '==', userId),
      where('podcastId', '==', podcastId),
      orderBy('viewedAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Find recent views by user and podcast within specified hours
   * @param userId User id
   * @param podcastId Podcast id
   * @param hours Number of hours to look back
   * @returns Recent view or null if not found
   */
  async findRecentByUserAndPodcast(userId: string, podcastId: string, hours: number): Promise<PodcastView | null> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - hours);
    
    const viewsRef = collection(firestore, this.collectionName);
    const q = query(
      viewsRef,
      where('userId', '==', userId),
      where('podcastId', '==', podcastId),
      where('viewedAt', '>=', thresholdDate),
      orderBy('viewedAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return this.mapToEntity({ id: doc.id, ...data });
  }

  /**
   * Get views over time for analytics
   * @param podcastId Podcast id
   * @param timeRange Time range for analytics
   * @returns Array of view counts over time
   */
  async getViewsOverTime(podcastId: string, timeRange: AnalyticsTimeRange): Promise<ViewsOverTime[]> {
    // Calculate the start date based on time range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020); // Set to a very early date
        break;
    }
    
    const viewsRef = collection(firestore, this.collectionName);
    const q = query(
      viewsRef,
      where('podcastId', '==', podcastId),
      where('viewedAt', '>=', startDate),
      where('viewedAt', '<=', endDate),
      orderBy('viewedAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Group views by date
    const viewsByDate = new Map<string, number>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const viewedAt = data.viewedAt instanceof Timestamp 
        ? data.viewedAt.toDate() 
        : new Date(data.viewedAt);
      
      const dateKey = viewedAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentCount = viewsByDate.get(dateKey) || 0;
      viewsByDate.set(dateKey, currentCount + 1);
    });
    
    // Convert to array and sort
    return Array.from(viewsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Find all views for a podcast with pagination
   * @param podcastId Podcast id
   * @param options Pagination options
   * @returns List of views
   */
  async findByPodcastId(podcastId: string, options?: PaginationOptions): Promise<PodcastView[]> {
    const viewsRef = collection(firestore, this.collectionName);
    
    let q = query(
      viewsRef,
      where('podcastId', '==', podcastId)
    );
    
    // Add sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(options.sortBy, sortOrder));
    } else {
      q = query(q, orderBy('viewedAt', 'desc'));
    }
    
    // Add pagination
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Find all views by a user with pagination
   * @param userId User id
   * @param options Pagination options
   * @returns List of views by the user
   */
  async findByUserId(userId: string, options?: PaginationOptions): Promise<PodcastView[]> {
    const viewsRef = collection(firestore, this.collectionName);
    
    let q = query(
      viewsRef,
      where('userId', '==', userId)
    );
    
    // Add sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(options.sortBy, sortOrder));
    } else {
      q = query(q, orderBy('viewedAt', 'desc'));
    }
    
    // Add pagination
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Delete all views for a podcast (used when podcast is deleted)
   * @param podcastId Podcast id
   * @returns Number of deleted views
   */
  async deleteByPodcastId(podcastId: string): Promise<number> {
    const viewsRef = collection(firestore, this.collectionName);
    const q = query(viewsRef, where('podcastId', '==', podcastId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return querySnapshot.size;
  }
}
