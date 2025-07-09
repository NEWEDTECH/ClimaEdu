import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import type { PodcastViewRepository } from '../../../infrastructure/repositories/PodcastViewRepository';
import type { PodcastLikeRepository } from '../../../infrastructure/repositories/PodcastLikeRepository';
import { DeletePodcastInput } from './delete-podcast.input';
import { DeletePodcastOutput } from './delete-podcast.output';

// Temporary symbols until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');
const PODCAST_VIEW_REPOSITORY_SYMBOL = Symbol.for('PodcastViewRepository');
const PODCAST_LIKE_REPOSITORY_SYMBOL = Symbol.for('PodcastLikeRepository');

/**
 * Use case for deleting a podcast
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class DeletePodcastUseCase {
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
  async execute(input: DeletePodcastInput): Promise<DeletePodcastOutput> {
    // Check if podcast exists
    const podcast = await this.podcastRepository.findById(input.podcastId);
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    // Delete associated views and likes first
    await Promise.all([
      this.podcastViewRepository.deleteByPodcastId(input.podcastId),
      this.podcastLikeRepository.deleteByPodcastId(input.podcastId)
    ]);

    // Delete the podcast
    const success = await this.podcastRepository.delete(input.podcastId);

    return { success };
  }
}
