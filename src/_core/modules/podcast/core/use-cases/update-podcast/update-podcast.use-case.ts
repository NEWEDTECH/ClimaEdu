import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import { UpdatePodcastInput } from './update-podcast.input';
import { UpdatePodcastOutput } from './update-podcast.output';

// Temporary symbol until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');

/**
 * Use case for updating a podcast
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdatePodcastUseCase {
  constructor(
    @inject(PODCAST_REPOSITORY_SYMBOL)
    private podcastRepository: PodcastRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: UpdatePodcastInput): Promise<UpdatePodcastOutput> {
    // Find the existing podcast
    const podcast = await this.podcastRepository.findById(input.podcastId);
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    // Update podcast properties using entity methods
    if (input.title !== undefined) {
      podcast.updateTitle(input.title);
    }

    if (input.description !== undefined) {
      podcast.updateDescription(input.description);
    }

    if (input.tags !== undefined) {
      podcast.updateTags(input.tags);
    }

    if (input.coverImageUrl !== undefined) {
      podcast.updateCoverImage(input.coverImageUrl);
    }

    if (input.mediaUrl !== undefined) {
      podcast.updateMediaUrl(input.mediaUrl);
    }

    if (input.mediaType !== undefined) {
      podcast.updateMediaType(input.mediaType);
    }

    // Save the updated podcast
    const savedPodcast = await this.podcastRepository.save(podcast);

    return { podcast: savedPodcast };
  }
}
