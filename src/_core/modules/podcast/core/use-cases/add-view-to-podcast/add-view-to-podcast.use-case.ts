import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import type { PodcastViewRepository } from '../../../infrastructure/repositories/PodcastViewRepository';
import { AddViewToPodcastInput } from './add-view-to-podcast.input';
import { AddViewToPodcastOutput } from './add-view-to-podcast.output';
import { PodcastView } from '../../entities/PodcastView';

// Temporary symbols until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');
const PODCAST_VIEW_REPOSITORY_SYMBOL = Symbol.for('PodcastViewRepository');

/**
 * Use case for adding a view to a podcast
 * Implements throttling to prevent spam views from the same user
 */
@injectable()
export class AddViewToPodcastUseCase {
  private readonly THROTTLE_HOURS = 1; // Prevent multiple views within 1 hour

  constructor(
    @inject(PODCAST_REPOSITORY_SYMBOL)
    private podcastRepository: PodcastRepository,
    @inject(PODCAST_VIEW_REPOSITORY_SYMBOL)
    private podcastViewRepository: PodcastViewRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: AddViewToPodcastInput): Promise<AddViewToPodcastOutput> {
    // Verify podcast exists
    const podcast = await this.podcastRepository.findById(input.podcastId);
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    // Check for recent views to prevent spam
    const recentView = await this.podcastViewRepository.findRecentByUserAndPodcast(
      input.userId,
      input.podcastId,
      this.THROTTLE_HOURS
    );

    // If there's a recent view, return it without creating a new one
    if (recentView) {
      return {
        view: recentView,
        isNewView: false
      };
    }

    // Create new view
    const viewId = await this.podcastViewRepository.generateId();
    const view = PodcastView.create({
      id: viewId,
      podcastId: input.podcastId,
      userId: input.userId,
      institutionId: podcast.institutionId,
      viewedAt: new Date()
    });

    // Save the view
    const savedView = await this.podcastViewRepository.save(view);

    return {
      view: savedView,
      isNewView: true
    };
  }
}
