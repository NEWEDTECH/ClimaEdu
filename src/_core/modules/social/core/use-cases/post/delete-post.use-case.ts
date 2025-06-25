import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import type { CommentLikeRepository } from '../../../infrastructure/repositories/CommentLikeRepository';
import { DeletePostInput } from './delete-post.input';
import { DeletePostOutput } from './delete-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for deleting a post with cascade deletion
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class DeletePostUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository,
    @inject(Register.social.repository.CommentRepository)
    private commentRepository: CommentRepository,
    @inject(Register.social.repository.PostLikeRepository)
    private postLikeRepository: PostLikeRepository,
    @inject(Register.social.repository.CommentLikeRepository)
    private commentLikeRepository: CommentLikeRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: DeletePostInput): Promise<DeletePostOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the post
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user is the author (only authors can delete their posts)
      if (post.authorId !== input.userId) {
        throw new Error('Only the author can delete the post');
      }

      // Cascade delete: First delete all related data
      await this.cascadeDeletePostData(input.postId);

      // Finally delete the post itself
      await this.postRepository.delete(input.postId);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in DeletePostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async cascadeDeletePostData(postId: string): Promise<void> {
    try {
      // Get all comments for this post
      const comments = await this.commentRepository.findByPost(postId);

      // Delete all comment likes for each comment
      for (const comment of comments) {
        const commentLikes = await this.commentLikeRepository.findByComment(comment.id);
        for (const commentLike of commentLikes) {
          await this.commentLikeRepository.delete(commentLike.id);
        }
      }

      // Delete all comments
      for (const comment of comments) {
        await this.commentRepository.delete(comment.id);
      }

      // Delete all post likes
      const postLikes = await this.postLikeRepository.findByPost(postId);
      for (const postLike of postLikes) {
        await this.postLikeRepository.delete(postLike.id);
      }
    } catch (error) {
      console.error('Error in cascade delete:', error);
      throw new Error('Failed to delete related data');
    }
  }

  private validateInput(input: DeletePostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
