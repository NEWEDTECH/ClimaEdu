import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { Comment } from '../../entities/Comment';
import { CreateCommentInput } from './create-comment.input';
import { CreateCommentOutput } from './create-comment.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for creating a comment on a post
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class CreateCommentUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository,
    @inject(Register.social.repository.CommentRepository)
    private commentRepository: CommentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: CreateCommentInput): Promise<CreateCommentOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if post exists
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // If it's a reply, check if parent comment exists
      if (input.parentCommentId) {
        const parentComment = await this.commentRepository.findById(input.parentCommentId);
        if (!parentComment) {
          throw new Error('Parent comment not found');
        }

        // Ensure parent comment belongs to the same post
        if (parentComment.postId !== input.postId) {
          throw new Error('Parent comment does not belong to the specified post');
        }
      }

      // Generate ID for the new comment
      const id = await this.commentRepository.generateId();

      // Create the comment entity
      const comment = Comment.create({
        id,
        postId: input.postId,
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
      console.error('Error in CreateCommentUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: CreateCommentInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    if (!input.authorId || input.authorId.trim().length === 0) {
      throw new Error('Author ID is required');
    }

    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }
  }
}
