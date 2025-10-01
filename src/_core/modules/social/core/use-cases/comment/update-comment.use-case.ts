import { injectable, inject } from 'inversify';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { UpdateCommentInput } from './update-comment.input';
import { UpdateCommentOutput } from './update-comment.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for updating a comment
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdateCommentUseCase {
  constructor(
    @inject(Register.social.repository.CommentRepository)
    private commentRepository: CommentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: UpdateCommentInput): Promise<UpdateCommentOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the comment
      const comment = await this.commentRepository.findById(input.commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user is the author
      if (comment.authorId !== input.userId) {
        throw new Error('Only the author can update the comment');
      }

      // Check edit time limitation (24 hours)
      const now = new Date();
      const timeDiff = now.getTime() - comment.createdAt.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        throw new Error('Comments can only be edited within 24 hours of creation');
      }

      // Update the comment content
      comment.updateContent(input.content);

      // Save the updated comment
      const savedComment = await this.commentRepository.save(comment);

      return {
        success: true,
        comment: savedComment
      };
    } catch (error) {
      console.error('Error in UpdateCommentUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: UpdateCommentInput): void {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error('Comment ID is required');
    }

    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    if (input.content.trim().length > 1000) {
      throw new Error('Comment content cannot exceed 1000 characters');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
