import { injectable, inject } from 'inversify';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import type { CommentLikeRepository } from '../../../infrastructure/repositories/CommentLikeRepository';
import { GetCommentLikesInput } from './get-comment-likes.input';
import { GetCommentLikesOutput } from './get-comment-likes.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for getting comment likes information
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class GetCommentLikesUseCase {
  constructor(
    @inject(Register.social.repository.CommentRepository)
    private commentRepository: CommentRepository,
    @inject(Register.social.repository.CommentLikeRepository)
    private commentLikeRepository: CommentLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: GetCommentLikesInput): Promise<GetCommentLikesOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if comment exists
      const comment = await this.commentRepository.findById(input.commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Get likes count and user's like status
      const [likesCount, userLike] = await Promise.all([
        this.commentLikeRepository.countByComment(input.commentId),
        this.commentLikeRepository.findByUserAndComment(input.userId, input.commentId)
      ]);

      return {
        success: true,
        likesCount,
        isLikedByUser: !!userLike
      };
    } catch (error) {
      console.error('Error in GetCommentLikesUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: GetCommentLikesInput): void {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error('Comment ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
