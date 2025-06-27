import { Podcast } from '../../core/entities/Podcast';

/**
 * Interface for the Podcast repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface PodcastRepository {
  /**
   * Generate a new unique ID for a podcast
   * @returns A unique ID with 'pod_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Find a podcast by id
   * @param id Podcast id
   * @returns Podcast or null if not found
   */
  findById(id: string): Promise<Podcast | null>;

  /**
   * Save a podcast
   * @param podcast Podcast to save
   * @returns Saved podcast
   */
  save(podcast: Podcast): Promise<Podcast>;

  /**
   * Delete a podcast
   * @param id Podcast id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List podcasts by institution
   * @param institutionId Institution id
   * @param options Optional pagination and filtering options
   * @returns List of podcasts
   */
  findByInstitutionId(institutionId: string, options?: ListPodcastsOptions): Promise<Podcast[]>;

  /**
   * Count total podcasts by institution
   * @param institutionId Institution id
   * @returns Total count of podcasts
   */
  countByInstitutionId(institutionId: string): Promise<number>;

  /**
   * Find podcasts by tags
   * @param institutionId Institution id
   * @param tags Array of tags to filter by
   * @param options Optional pagination options
   * @returns List of podcasts matching the tags
   */
  findByTags(institutionId: string, tags: string[], options?: ListPodcastsOptions): Promise<Podcast[]>;
}

/**
 * Options for listing podcasts
 */
export interface ListPodcastsOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
