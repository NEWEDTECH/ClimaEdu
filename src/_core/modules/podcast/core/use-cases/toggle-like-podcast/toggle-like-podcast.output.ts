import { PodcastLike } from '../../entities/PodcastLike';

/**
 * Output data for toggling a like on a podcast
 */
export interface ToggleLikePodcastOutput {
  like: PodcastLike | null;
  isLiked: boolean;
  action: 'liked' | 'unliked';
}
