import { PodcastLike } from '../../core/entities/PodcastLike';

/**
 * Interface for the PodcastLike repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface PodcastLikeRepository {
  /**
   * Generate a new unique ID for a podcast like
   * @returns A unique ID with 'podl_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Save a podcast like
   * @param like PodcastLike to save
   * @returns Saved podcast like
   */
  save(like: PodcastLike): Promise<PodcastLike>;

  /**
   * Find a podcast like by id
   * @param id PodcastLike id
   * @returns PodcastLike or null if not found
   */
  findById(id: string): Promise<PodcastLike | null>;

  /**
   * Delete a podcast like
   * @param id PodcastLike id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count total likes for a podcast
   * @param podcastId Podcast id
   * @returns Total number of likes
   */
  countByPodcastId(podcastId: string): Promise<number>;

  /**
   * Find a like by user and podcast
   * @param userId User id
   * @param podcastId Podcast id
   * @returns PodcastLike or null if not found
   */
  findByUserAndPodcast(userId: string, podcastId: string): Promise<PodcastLike | null>;

  /**
   * Get likes over time for analytics
   * @param podcastId Podcast id
   * @param timeRange Time range for analytics
   * @returns Array of like counts over time
   */
  getLikesOverTime(podcastId: string, timeRange: AnalyticsTimeRange): Promise<LikesOverTime[]>;

  /**
   * Find all likes for a podcast with pagination
   * @param podcastId Podcast id
   * @param options Pagination options
   * @returns List of likes
   */
  findByPodcastId(podcastId: string, options?: PaginationOptions): Promise<PodcastLike[]>;

  /**
   * Find all likes by a user with pagination
   * @param userId User id
   * @param options Pagination options
   * @returns List of likes by the user
   */
  findByUserId(userId: string, options?: PaginationOptions): Promise<PodcastLike[]>;

  /**
   * Delete all likes for a podcast (used when podcast is deleted)
   * @param podcastId Podcast id
   * @returns Number of deleted likes
   */
  deleteByPodcastId(podcastId: string): Promise<number>;

  /**
   * Check if a user has liked a podcast
   * @param userId User id
   * @param podcastId Podcast id
   * @returns true if user has liked the podcast, false otherwise
   */
  hasUserLikedPodcast(userId: string, podcastId: string): Promise<boolean>;

  /**
   * Get top liked podcasts for an institution
   * @param institutionId Institution id
   * @param limit Maximum number of podcasts to return
   * @returns Array of podcast IDs with their like counts
   */
  getTopLikedPodcasts(institutionId: string, limit: number): Promise<TopLikedPodcast[]>;
}

/**
 * Analytics time range options
 */
export type AnalyticsTimeRange = 'week' | 'month' | 'year' | 'all';

/**
 * Likes over time data structure
 */
export interface LikesOverTime {
  date: string; // ISO date string
  count: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'likedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Top liked podcast data structure
 */
export interface TopLikedPodcast {
  podcastId: string;
  likeCount: number;
}
