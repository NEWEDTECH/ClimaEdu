import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  DocumentData, 
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { Podcast } from '../../../core/entities/Podcast';
import { PodcastMediaType } from '../../../core/entities/PodcastMediaType';
import type { PodcastRepository, ListPodcastsOptions } from '../PodcastRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the PodcastRepository
 */
@injectable()
export class FirebasePodcastRepository implements PodcastRepository {
  private readonly collectionName = 'podcasts';
  private readonly idPrefix = 'pod_';

  /**
   * Generate a new unique ID for a podcast
   * @returns A unique ID with the podcast prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a Podcast entity
   * @param data Firestore document data
   * @returns Podcast entity
   */
  private mapToEntity(data: DocumentData): Podcast {
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    // Create and return a Podcast entity
    return Podcast.create({
      id: data.id,
      institutionId: data.institutionId,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      coverImageUrl: data.coverImageUrl,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType as PodcastMediaType,
      createdAt,
      updatedAt
    });
  }

  /**
   * Find a podcast by id
   * @param id Podcast id
   * @returns Podcast or null if not found
   */
  async findById(id: string): Promise<Podcast | null> {
    const podcastRef = doc(firestore, this.collectionName, id);
    const podcastDoc = await getDoc(podcastRef);

    if (!podcastDoc.exists()) {
      return null;
    }

    const data = podcastDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /**
   * Save a podcast
   * @param podcast Podcast to save
   * @returns Saved podcast
   */
  async save(podcast: Podcast): Promise<Podcast> {
    const podcastRef = doc(firestore, this.collectionName, podcast.id);
    
    // Prepare the podcast data for Firestore
    const podcastData = {
      id: podcast.id,
      institutionId: podcast.institutionId,
      title: podcast.title,
      description: podcast.description,
      tags: podcast.tags,
      coverImageUrl: podcast.coverImageUrl,
      mediaUrl: podcast.mediaUrl,
      mediaType: podcast.mediaType,
      createdAt: podcast.createdAt,
      updatedAt: podcast.updatedAt
    };

    // Check if the podcast already exists
    const podcastDoc = await getDoc(podcastRef);
    
    if (podcastDoc.exists()) {
      // Update existing podcast
      await updateDoc(podcastRef, podcastData);
    } else {
      // Create new podcast
      await setDoc(podcastRef, podcastData);
    }

    return podcast;
  }

  /**
   * Delete a podcast
   * @param id Podcast id
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const podcastRef = doc(firestore, this.collectionName, id);
    const podcastDoc = await getDoc(podcastRef);

    if (!podcastDoc.exists()) {
      return false;
    }

    await deleteDoc(podcastRef);
    return true;
  }

  /**
   * List podcasts by institution
   * @param institutionId Institution id
   * @param options Optional pagination and filtering options
   * @returns List of podcasts
   */
  async findByInstitutionId(institutionId: string, options?: ListPodcastsOptions): Promise<Podcast[]> {
    const podcastsRef = collection(firestore, this.collectionName);
    
    // Build the query
    let q = query(
      podcastsRef, 
      where('institutionId', '==', institutionId)
    );

    // Add sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(options.sortBy, sortOrder));
    } else {
      // Default sort by creation date
      q = query(q, orderBy('createdAt', 'desc'));
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
   * Count total podcasts by institution
   * @param institutionId Institution id
   * @returns Total count of podcasts
   */
  async countByInstitutionId(institutionId: string): Promise<number> {
    const podcastsRef = collection(firestore, this.collectionName);
    const q = query(podcastsRef, where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  }

  /**
   * Find podcasts by tags
   * @param institutionId Institution id
   * @param tags Array of tags to filter by
   * @param options Optional pagination options
   * @returns List of podcasts matching the tags
   */
  async findByTags(institutionId: string, tags: string[], options?: ListPodcastsOptions): Promise<Podcast[]> {
    if (tags.length === 0) {
      return this.findByInstitutionId(institutionId, options);
    }

    const podcastsRef = collection(firestore, this.collectionName);
    
    // Build the query with tag filtering
    let q = query(
      podcastsRef,
      where('institutionId', '==', institutionId),
      where('tags', 'array-contains-any', tags)
    );

    // Add sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(options.sortBy, sortOrder));
    } else {
      // Default sort by creation date
      q = query(q, orderBy('createdAt', 'desc'));
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
}
