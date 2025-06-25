import { injectable, inject } from 'inversify';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import { UnlikePostInput } from './unlike-post.input';
import { UnlikePostOutput } from './unlike-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for unliking a post
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UnlikePostUseCase {
  constructor(
    @inject(Register.social.repository.PostLikeRepository)
    private postLikeRepository: PostLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: UnlikePostInput): Promise<UnlikePostOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the existing like
      const existingLike = await this.postLikeRepository.findByUserAndPost(
        input.userId,
        input.postId
      );

      if (!existingLike) {
        throw new Error('Like not found - user has not liked this post');
      }

      // Delete the like
      await this.postLikeRepository.delete(existingLike.id);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in UnlikePostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: UnlikePostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
