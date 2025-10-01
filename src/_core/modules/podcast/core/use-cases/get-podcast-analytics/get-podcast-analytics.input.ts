import type { AnalyticsTimeRange } from '../../../infrastructure/repositories/PodcastViewRepository';

/**
 * Input data for getting podcast analytics
 */
export interface GetPodcastAnalyticsInput {
  podcastId: string;
  timeRange: AnalyticsTimeRange;
}
