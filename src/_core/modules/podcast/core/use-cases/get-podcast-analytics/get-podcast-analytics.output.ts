import type { ViewsOverTime } from '../../../infrastructure/repositories/PodcastViewRepository';
import type { LikesOverTime } from '../../../infrastructure/repositories/PodcastLikeRepository';

/**
 * Output data for getting podcast analytics
 */
export interface GetPodcastAnalyticsOutput {
  totalViews: number;
  uniqueViewers: number;
  totalLikes: number;
  viewsOverTime: ViewsOverTime[];
  likesOverTime: LikesOverTime[];
  engagementRate: number; // likes / views ratio
}
