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
  orderBy, 
  limit, 
  DocumentData, 
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { PodcastLike } from '../../../core/entities/PodcastLike';
import type { 
  PodcastLikeRepository, 
  AnalyticsTimeRange, 
  LikesOverTime, 
  PaginationOptions,
  TopLikedPodcast 
} from '../PodcastLikeRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the PodcastLikeRepository
 */
@injectable()
export class FirebasePodcastLikeRepository implements PodcastLikeRepository {
  private readonly collectionName = 'podcast_likes';
  private readonly idPrefix = 'podl_';

  /**
   * Generate a new unique ID for a podcast like
   * @returns A unique ID with the podcast like prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a PodcastLike entity
   * @param data Firestore document data
   * @returns PodcastLike entity
   */
  private mapToEntity(data: DocumentData): PodcastLike {
    // Convert Firestore timestamps to Date objects
    const likedAt = data.likedAt instanceof Timestamp 
      ? data.likedAt.toDate() 
      : new Date(data.likedAt);
    
    // Create and return a PodcastLike entity
    return PodcastLike.create({
      id: data.id,
      podcastId: data.podcastId,
      userId: data.userId,
      institutionId: data.institutionId,
      likedAt
    });
  }

  /**
   * Save a podcast like
   * @param like PodcastLike to save
   * @returns Saved podcast like
   */
  async save(like: PodcastLike): Promise<PodcastLike> {
    const likeRef = doc(firestore, this.collectionName, like.id);
    
    // Prepare the like data for Firestore
    const likeData = {
      id: like.id,
      podcastId: like.podcastId,
      userId: like.userId,
      institutionId: like.institutionId,
      likedAt: like.likedAt
    };

    await setDoc(likeRef, likeData);
    return like;
  }

  /**
   * Find a podcast like by id
   * @param id PodcastLike id
   * @returns PodcastLike or null if not found
   */
  async findById(id: string): Promise<PodcastLike | null> {
    const likeRef = doc(firestore, this.collectionName, id);
    const likeDoc = await getDoc(likeRef);

    if (!likeDoc.exists()) {
      return null;
    }

    const data = likeDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Delete a podcast like
   * @param id PodcastLike id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const likeRef = doc(firestore, this.collectionName, id);
    const likeDoc = await getDoc(likeRef);

    if (!likeDoc.exists()) {
      return false;
    }

    await deleteDoc(likeRef);
    return true;
  }

  /**
   * Count total likes for a podcast
   * @param podcastId Podcast id
   * @returns Total number of likes
   */
  async countByPodcastId(podcastId: string): Promise<number> {
    const likesRef = collection(firestore, this.collectionName);
    const q = query(likesRef, where('podcastId', '==', podcastId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  /**
   * Find a like by user and podcast
   * @param userId User id
   * @param podcastId Podcast id
   * @returns PodcastLike or null if not found
   */
  async findByUserAndPodcast(userId: string, podcastId: string): Promise<PodcastLike | null> {
    const likesRef = collection(firestore, this.collectionName);
    const q = query(
      likesRef, 
      where('userId', '==', userId),
      where('podcastId', '==', podcastId),
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
   * Get likes over time for analytics
   * @param podcastId Podcast id
   * @param timeRange Time range for analytics
   * @returns Array of like counts over time
   */
  async getLikesOverTime(podcastId: string, timeRange: AnalyticsTimeRange): Promise<LikesOverTime[]> {
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
    
    const likesRef = collection(firestore, this.collectionName);
    const q = query(
      likesRef,
      where('podcastId', '==', podcastId),
      where('likedAt', '>=', startDate),
      where('likedAt', '<=', endDate),
      orderBy('likedAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Group likes by date
    const likesByDate = new Map<string, number>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const likedAt = data.likedAt instanceof Timestamp 
        ? data.likedAt.toDate() 
        : new Date(data.likedAt);
      
      const dateKey = likedAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentCount = likesByDate.get(dateKey) || 0;
      likesByDate.set(dateKey, currentCount + 1);
    });
    
    // Convert to array and sort
    return Array.from(likesByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Find all likes for a podcast with pagination
   * @param podcastId Podcast id
   * @param options Pagination options
   * @returns List of likes
   */
  async findByPodcastId(podcastId: string, options?: PaginationOptions): Promise<PodcastLike[]> {
    const likesRef = collection(firestore, this.collectionName);
    
    let q = query(
      likesRef,
      where('podcastId', '==', podcastId)
    );
    
    // Add sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(options.sortBy, sortOrder));
    } else {
      q = query(q, orderBy('likedAt', 'desc'));
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
   * Find all likes by a user with pagination
   * @param userId User id
   * @param options Pagination options
   * @returns List of likes by the user
   */
  async findByUserId(userId: string, options?: PaginationOptions): Promise<PodcastLike[]> {
    const likesRef = collection(firestore, this.collectionName);
    
    let q = query(
      likesRef,
      where('userId', '==', userId)
    );
    
    // Add sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(options.sortBy, sortOrder));
    } else {
      q = query(q, orderBy('likedAt', 'desc'));
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
   * Delete all likes for a podcast (used when podcast is deleted)
   * @param podcastId Podcast id
   * @returns Number of deleted likes
   */
  async deleteByPodcastId(podcastId: string): Promise<number> {
    const likesRef = collection(firestore, this.collectionName);
    const q = query(likesRef, where('podcastId', '==', podcastId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return querySnapshot.size;
  }

  /**
   * Check if a user has liked a podcast
   * @param userId User id
   * @param podcastId Podcast id
   * @returns true if user has liked the podcast, false otherwise
   */
  async hasUserLikedPodcast(userId: string, podcastId: string): Promise<boolean> {
    const like = await this.findByUserAndPodcast(userId, podcastId);
    return like !== null;
  }

  /**
   * Get top liked podcasts for an institution
   * @param institutionId Institution id
   * @param limit Maximum number of podcasts to return
   * @returns Array of podcast IDs with their like counts
   */
  async getTopLikedPodcasts(institutionId: string, limitCount: number): Promise<TopLikedPodcast[]> {
    const likesRef = collection(firestore, this.collectionName);
    const q = query(
      likesRef,
      where('institutionId', '==', institutionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Count likes per podcast
    const likeCountsByPodcast = new Map<string, number>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const podcastId = data.podcastId;
      const currentCount = likeCountsByPodcast.get(podcastId) || 0;
      likeCountsByPodcast.set(podcastId, currentCount + 1);
    });
    
    // Convert to array, sort by like count, and limit results
    return Array.from(likeCountsByPodcast.entries())
      .map(([podcastId, likeCount]) => ({ podcastId, likeCount }))
      .sort((a, b) => b.likeCount - a.likeCount) // Sort descending by like count
      .slice(0, limitCount);
  }
}
