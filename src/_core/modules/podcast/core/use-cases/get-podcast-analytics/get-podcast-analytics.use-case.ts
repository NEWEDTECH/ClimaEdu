import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import type { PodcastViewRepository } from '../../../infrastructure/repositories/PodcastViewRepository';
import type { PodcastLikeRepository } from '../../../infrastructure/repositories/PodcastLikeRepository';
import { GetPodcastAnalyticsInput } from './get-podcast-analytics.input';
import { GetPodcastAnalyticsOutput } from './get-podcast-analytics.output';

// Temporary symbols until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');
const PODCAST_VIEW_REPOSITORY_SYMBOL = Symbol.for('PodcastViewRepository');
const PODCAST_LIKE_REPOSITORY_SYMBOL = Symbol.for('PodcastLikeRepository');

/**
 * Use case for getting comprehensive podcast analytics
 * Provides views, likes, and engagement metrics over time
 */
@injectable()
export class GetPodcastAnalyticsUseCase {
  constructor(
    @inject(PODCAST_REPOSITORY_SYMBOL)
    private podcastRepository: PodcastRepository,
    @inject(PODCAST_VIEW_REPOSITORY_SYMBOL)
    private podcastViewRepository: PodcastViewRepository,
    @inject(PODCAST_LIKE_REPOSITORY_SYMBOL)
    private podcastLikeRepository: PodcastLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: GetPodcastAnalyticsInput): Promise<GetPodcastAnalyticsOutput> {
    // Verify podcast exists
    const podcast = await this.podcastRepository.findById(input.podcastId);
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    // Get all analytics data in parallel for better performance
    const [
      totalViews,
      uniqueViewers,
      totalLikes,
      viewsOverTime,
      likesOverTime
    ] = await Promise.all([
      this.podcastViewRepository.countByPodcastId(input.podcastId),
      this.podcastViewRepository.countUniqueViewersByPodcastId(input.podcastId),
      this.podcastLikeRepository.countByPodcastId(input.podcastId),
      this.podcastViewRepository.getViewsOverTime(input.podcastId, input.timeRange),
      this.podcastLikeRepository.getLikesOverTime(input.podcastId, input.timeRange)
    ]);

    // Calculate engagement rate (likes/views ratio)
    const engagementRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    return {
      totalViews,
      uniqueViewers,
      totalLikes,
      viewsOverTime,
      likesOverTime,
      engagementRate: Math.round(engagementRate * 100) / 100 // Round to 2 decimal places
    };
  }
}
