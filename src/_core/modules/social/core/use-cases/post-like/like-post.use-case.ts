import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import { PostLike } from '../../entities/PostLike';
import { LikePostInput } from './like-post.input';
import { LikePostOutput } from './like-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for liking a post
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class LikePostUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository,
    @inject(Register.social.repository.PostLikeRepository)
    private postLikeRepository: PostLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: LikePostInput): Promise<LikePostOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if post exists
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user already liked this post
      const existingLike = await this.postLikeRepository.findByUserAndPost(
        input.userId,
        input.postId
      );

      if (existingLike) {
        throw new Error('User has already liked this post');
      }

      // Generate ID for the new like
      const id = await this.postLikeRepository.generateId();

      // Create the post like entity
      const postLike = PostLike.create({
        id,
        postId: input.postId,
        userId: input.userId,
        institutionId: input.institutionId
      });

      // Save the post like
      const savedPostLike = await this.postLikeRepository.save(postLike);

      return {
        success: true,
        postLike: savedPostLike
      };
    } catch (error) {
      console.error('Error in LikePostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: LikePostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }
  }
}
