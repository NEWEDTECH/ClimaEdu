import { Podcast } from '../../entities/Podcast';

/**
 * Output data for listing podcasts
 */
export interface ListPodcastsOutput {
  podcasts: Podcast[];
  total: number;
  hasMore: boolean;
}
