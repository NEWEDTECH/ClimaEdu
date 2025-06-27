import { injectable, inject } from 'inversify';
import type { CommentLikeRepository } from '../../../infrastructure/repositories/CommentLikeRepository';
import { UnlikeCommentInput } from './unlike-comment.input';
import { UnlikeCommentOutput } from './unlike-comment.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for unliking a comment
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UnlikeCommentUseCase {
  constructor(
    @inject(Register.social.repository.CommentLikeRepository)
    private commentLikeRepository: CommentLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: UnlikeCommentInput): Promise<UnlikeCommentOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the existing like
      const existingLike = await this.commentLikeRepository.findByUserAndComment(
        input.userId,
        input.commentId
      );

      if (!existingLike) {
        throw new Error('Like not found - user has not liked this comment');
      }

      // Delete the like
      await this.commentLikeRepository.delete(existingLike.id);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in UnlikeCommentUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: UnlikeCommentInput): void {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error('Comment ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
