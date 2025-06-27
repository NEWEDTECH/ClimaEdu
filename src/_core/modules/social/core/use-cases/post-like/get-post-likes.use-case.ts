import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import { GetPostLikesInput } from './get-post-likes.input';
import { GetPostLikesOutput } from './get-post-likes.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for getting post likes information
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class GetPostLikesUseCase {
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
  async execute(input: GetPostLikesInput): Promise<GetPostLikesOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if post exists
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check access permissions
      // If post is not published, only the author can see it
      if (!post.isPublished() && post.authorId !== input.userId) {
        throw new Error('Access denied - post is not published');
      }

      // Get likes count and user's like status
      const [likesCount, userLike] = await Promise.all([
        this.postLikeRepository.countByPost(input.postId),
        this.postLikeRepository.findByUserAndPost(input.userId, input.postId)
      ]);

      return {
        success: true,
        likesCount,
        isLikedByUser: !!userLike
      };
    } catch (error) {
      console.error('Error in GetPostLikesUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: GetPostLikesInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
