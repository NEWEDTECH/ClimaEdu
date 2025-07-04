import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import { GetPodcastInput } from './get-podcast.input';
import { GetPodcastOutput } from './get-podcast.output';

// Temporary symbol until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');

/**
 * Use case for getting a podcast
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class GetPodcastUseCase {
  constructor(
    @inject(PODCAST_REPOSITORY_SYMBOL)
    private podcastRepository: PodcastRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: GetPodcastInput): Promise<GetPodcastOutput> {
    // Find the podcast
    const podcast = await this.podcastRepository.findById(input.podcastId);
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    return { podcast };
  }
}
