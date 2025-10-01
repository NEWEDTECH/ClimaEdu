import { injectable, inject } from 'inversify';
import type { PodcastRepository } from '../../../infrastructure/repositories/PodcastRepository';
import type { PodcastLikeRepository } from '../../../infrastructure/repositories/PodcastLikeRepository';
import { ToggleLikePodcastInput } from './toggle-like-podcast.input';
import { ToggleLikePodcastOutput } from './toggle-like-podcast.output';
import { PodcastLike } from '../../entities/PodcastLike';

// Temporary symbols until we create the podcast container
const PODCAST_REPOSITORY_SYMBOL = Symbol.for('PodcastRepository');
const PODCAST_LIKE_REPOSITORY_SYMBOL = Symbol.for('PodcastLikeRepository');

/**
 * Use case for toggling a like on a podcast
 * If user has already liked, it removes the like. If not, it adds a like.
 */
@injectable()
export class ToggleLikePodcastUseCase {
  constructor(
    @inject(PODCAST_REPOSITORY_SYMBOL)
    private podcastRepository: PodcastRepository,
    @inject(PODCAST_LIKE_REPOSITORY_SYMBOL)
    private podcastLikeRepository: PodcastLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ToggleLikePodcastInput): Promise<ToggleLikePodcastOutput> {
    // Verify podcast exists
    const podcast = await this.podcastRepository.findById(input.podcastId);
    if (!podcast) {
      throw new Error('Podcast not found');
    }

    // Check if user has already liked this podcast
    const existingLike = await this.podcastLikeRepository.findByUserAndPodcast(
      input.userId,
      input.podcastId
    );

    // If like exists, remove it (unlike)
    if (existingLike) {
      const success = await this.podcastLikeRepository.delete(existingLike.id);
      if (!success) {
        throw new Error('Failed to remove like');
      }

      return {
        like: null,
        isLiked: false,
        action: 'unliked'
      };
    }

    // If like doesn't exist, create it (like)
    const likeId = await this.podcastLikeRepository.generateId();
    const like = PodcastLike.create({
      id: likeId,
      podcastId: input.podcastId,
      userId: input.userId,
      institutionId: podcast.institutionId,
      likedAt: new Date()
    });

    // Save the like
    const savedLike = await this.podcastLikeRepository.save(like);

    return {
      like: savedLike,
      isLiked: true,
      action: 'liked'
    };
  }
}
