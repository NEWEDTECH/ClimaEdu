import { PodcastMediaType } from '../../entities/PodcastMediaType';

/**
 * Input data for creating a podcast
 */
export interface CreatePodcastInput {
  institutionId: string;
  title: string;
  description: string;
  tags?: string[];
  coverImageUrl: string;
  mediaUrl: string;
  mediaType: PodcastMediaType;
}
