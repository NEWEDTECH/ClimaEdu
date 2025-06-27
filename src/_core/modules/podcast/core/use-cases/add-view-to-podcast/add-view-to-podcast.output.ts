import { PodcastView } from '../../entities/PodcastView';

/**
 * Output data for adding a view to a podcast
 */
export interface AddViewToPodcastOutput {
  view: PodcastView;
  isNewView: boolean;
}
