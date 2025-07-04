import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import { Register } from '@/_core/shared/container';
import { CreatePodcastInput } from './create-podcast.input';
import { CreatePodcastOutput } from './create-podcast.output';
import { Podcast } from '../../entities/Podcast';

/**
 * Use case for creating a podcast
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreatePodcastUseCase {
  constructor(
    @inject(Register.podcast.repository.PodcastRepository)
    private podcastRepository: PodcastRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: CreatePodcastInput): Promise<CreatePodcastOutput> {
    // Generate ID and create podcast entity
    const id = await this.podcastRepository.generateId();
    const podcast = Podcast.create({
      id,
      institutionId: input.institutionId,
      title: input.title,
      description: input.description,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
    });

    // Save the podcast
    const savedPodcast = await this.podcastRepository.save(podcast);

    return { podcast: savedPodcast };
  }
}
