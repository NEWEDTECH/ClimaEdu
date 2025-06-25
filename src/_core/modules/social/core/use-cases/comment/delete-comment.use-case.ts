import { injectable, inject } from 'inversify';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import type { CommentLikeRepository } from '../../../infrastructure/repositories/CommentLikeRepository';
import { DeleteCommentInput } from './delete-comment.input';
import { DeleteCommentOutput } from './delete-comment.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for deleting a comment with cascade deletion
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class DeleteCommentUseCase {
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
  async execute(input: DeleteCommentInput): Promise<DeleteCommentOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the comment
      const comment = await this.commentRepository.findById(input.commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user is the author (only authors can delete their comments)
      if (comment.authorId !== input.userId) {
        throw new Error('Only the author can delete the comment');
      }

      // Cascade delete: First delete all related data
      await this.cascadeDeleteCommentData(input.commentId);

      // Finally delete the comment itself
      await this.commentRepository.delete(input.commentId);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in DeleteCommentUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async cascadeDeleteCommentData(commentId: string): Promise<void> {
    try {
      // Delete all replies to this comment
      const replies = await this.commentRepository.findReplies(commentId);
      for (const reply of replies) {
        // Delete likes for each reply
        const replyLikes = await this.commentLikeRepository.findByComment(reply.id);
        for (const replyLike of replyLikes) {
          await this.commentLikeRepository.delete(replyLike.id);
        }
        // Delete the reply
        await this.commentRepository.delete(reply.id);
      }

      // Delete all likes for the main comment
      const commentLikes = await this.commentLikeRepository.findByComment(commentId);
      for (const commentLike of commentLikes) {
        await this.commentLikeRepository.delete(commentLike.id);
      }
    } catch (error) {
      console.error('Error in cascade delete:', error);
      throw new Error('Failed to delete related data');
    }
  }

  private validateInput(input: DeleteCommentInput): void {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error('Comment ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
