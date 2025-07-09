import { PodcastView } from '../../core/entities/PodcastView';

/**
 * Interface for the PodcastView repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface PodcastViewRepository {
  /**
   * Generate a new unique ID for a podcast view
   * @returns A unique ID with 'podv_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Save a podcast view
   * @param view PodcastView to save
   * @returns Saved podcast view
   */
  save(view: PodcastView): Promise<PodcastView>;

  /**
   * Find a podcast view by id
   * @param id PodcastView id
   * @returns PodcastView or null if not found
   */
  findById(id: string): Promise<PodcastView | null>;

  /**
   * Count total views for a podcast
   * @param podcastId Podcast id
   * @returns Total number of views
   */
  countByPodcastId(podcastId: string): Promise<number>;

  /**
   * Count unique viewers for a podcast
   * @param podcastId Podcast id
   * @returns Number of unique viewers
   */
  countUniqueViewersByPodcastId(podcastId: string): Promise<number>;

  /**
   * Find a view by user and podcast
   * @param userId User id
   * @param podcastId Podcast id
   * @returns Most recent view or null if not found
   */
  findByUserAndPodcast(userId: string, podcastId: string): Promise<PodcastView | null>;

  /**
   * Find recent views by user and podcast within specified hours
   * @param userId User id
   * @param podcastId Podcast id
   * @param hours Number of hours to look back
   * @returns Recent view or null if not found
   */
  findRecentByUserAndPodcast(userId: string, podcastId: string, hours: number): Promise<PodcastView | null>;

  /**
   * Get views over time for analytics
   * @param podcastId Podcast id
   * @param timeRange Time range for analytics
   * @returns Array of view counts over time
   */
  getViewsOverTime(podcastId: string, timeRange: AnalyticsTimeRange): Promise<ViewsOverTime[]>;

  /**
   * Find all views for a podcast with pagination
   * @param podcastId Podcast id
   * @param options Pagination options
   * @returns List of views
   */
  findByPodcastId(podcastId: string, options?: PaginationOptions): Promise<PodcastView[]>;

  /**
   * Find all views by a user with pagination
   * @param userId User id
   * @param options Pagination options
   * @returns List of views by the user
   */
  findByUserId(userId: string, options?: PaginationOptions): Promise<PodcastView[]>;

  /**
   * Delete all views for a podcast (used when podcast is deleted)
   * @param podcastId Podcast id
   * @returns Number of deleted views
   */
  deleteByPodcastId(podcastId: string): Promise<number>;
}

/**
 * Analytics time range options
 */
export type AnalyticsTimeRange = 'week' | 'month' | 'year' | 'all';

/**
 * Views over time data structure
 */
export interface ViewsOverTime {
  date: string; // ISO date string
  count: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'viewedAt';
  sortOrder?: 'asc' | 'desc';
}
