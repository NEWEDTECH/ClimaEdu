import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import { ListPodcastsInput } from './list-podcasts.input';
import { ListPodcastsOutput } from './list-podcasts.output';

// Temporary symbol until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');

/**
 * Use case for listing podcasts
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class ListPodcastsUseCase {
  constructor(
    @inject(PODCAST_REPOSITORY_SYMBOL)
    private podcastRepository: PodcastRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ListPodcastsInput): Promise<ListPodcastsOutput> {
    const options = {
      page: input.page,
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Get podcasts based on whether tags are provided
    let podcasts;
    if (input.tags && input.tags.length > 0) {
      podcasts = await this.podcastRepository.findByTags(
        input.institutionId,
        input.tags,
        options
      );
    } else {
      podcasts = await this.podcastRepository.findByInstitutionId(
        input.institutionId,
        options
      );
    }

    // Get total count
    const total = await this.podcastRepository.countByInstitutionId(input.institutionId);

    // Calculate if there are more results
    const limit = input.limit || 20;
    const page = input.page || 1;
    const hasMore = (page * limit) < total;

    return {
      podcasts,
      total,
      hasMore,
    };
  }
}
