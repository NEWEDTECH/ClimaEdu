import { injectable, inject } from 'inversify';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import type { CommentLikeRepository } from '../../../infrastructure/repositories/CommentLikeRepository';
import { CommentLike } from '../../entities/CommentLike';
import { LikeCommentInput } from './like-comment.input';
import { LikeCommentOutput } from './like-comment.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for liking a comment
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class LikeCommentUseCase {
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
  async execute(input: LikeCommentInput): Promise<LikeCommentOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if comment exists
      const comment = await this.commentRepository.findById(input.commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user already liked this comment
      const existingLike = await this.commentLikeRepository.findByUserAndComment(
        input.userId,
        input.commentId
      );

      if (existingLike) {
        throw new Error('User has already liked this comment');
      }

      // Generate ID for the new like
      const id = await this.commentLikeRepository.generateId();

      // Create the comment like entity
      const commentLike = CommentLike.create({
        id,
        commentId: input.commentId,
        userId: input.userId,
        institutionId: input.institutionId
      });

      // Save the comment like
      const savedCommentLike = await this.commentLikeRepository.save(commentLike);

      return {
        success: true,
        commentLike: savedCommentLike
      };
    } catch (error) {
      console.error('Error in LikeCommentUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: LikeCommentInput): void {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error('Comment ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }
  }
}
