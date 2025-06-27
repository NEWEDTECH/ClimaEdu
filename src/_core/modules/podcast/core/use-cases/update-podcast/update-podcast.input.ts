import { PodcastMediaType } from '../../entities/PodcastMediaType';

/**
 * Input data for updating a podcast
 */
export interface UpdatePodcastInput {
  podcastId: string;
  title?: string;
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  mediaUrl?: string;
  mediaType?: PodcastMediaType;
}
