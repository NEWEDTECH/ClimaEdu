import { injectable, inject } from 'inversify';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { Comment } from '../../entities/Comment';
import { ReplyToCommentInput } from './reply-to-comment.input';
import { ReplyToCommentOutput } from './reply-to-comment.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for replying to a comment
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class ReplyToCommentUseCase {
  constructor(
    @inject(Register.social.repository.CommentRepository)
    private commentRepository: CommentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ReplyToCommentInput): Promise<ReplyToCommentOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if parent comment exists
      const parentComment = await this.commentRepository.findById(input.parentCommentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      // Check if parent comment is already a reply (prevent nested replies beyond one level)
      if (parentComment.isReply()) {
        throw new Error('Cannot reply to a reply - only one level of nesting is allowed');
      }

      // Generate ID for the new comment
      const id = await this.commentRepository.generateId();

      // Create the reply comment entity
      const comment = Comment.create({
        id,
        postId: parentComment.postId,
        parentCommentId: input.parentCommentId,
        authorId: input.authorId,
        institutionId: input.institutionId,
        content: input.content
      });

      // Save the comment
      const savedComment = await this.commentRepository.save(comment);

      return {
        success: true,
        comment: savedComment
      };
    } catch (error) {
      console.error('Error in ReplyToCommentUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: ReplyToCommentInput): void {
    if (!input.parentCommentId || input.parentCommentId.trim().length === 0) {
      throw new Error('Parent comment ID is required');
    }

    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    if (input.content.trim().length > 1000) {
      throw new Error('Comment content cannot exceed 1000 characters');
    }

    if (!input.authorId || input.authorId.trim().length === 0) {
      throw new Error('Author ID is required');
    }

    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }
  }
}
