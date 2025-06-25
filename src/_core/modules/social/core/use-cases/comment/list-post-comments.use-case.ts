import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import type { CommentLikeRepository } from '../../../infrastructure/repositories/CommentLikeRepository';
import { Comment } from '../../entities/Comment';
import { ListPostCommentsInput } from './list-post-comments.input';
import { ListPostCommentsOutput, CommentWithMetadata } from './list-post-comments.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for listing post comments with metadata
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class ListPostCommentsUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository,
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
  async execute(input: ListPostCommentsInput): Promise<ListPostCommentsOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Check if post exists
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Get all comments for the post
      const allComments = await this.commentRepository.findByPost(input.postId);

      // Separate root comments from replies
      const rootComments = allComments.filter(comment => !comment.parentCommentId);
      const replies = allComments.filter(comment => comment.parentCommentId);

      // Build comments with metadata
      const commentsWithMetadata: CommentWithMetadata[] = await Promise.all(
        rootComments.map(async (comment) => {
          const metadata = await this.buildCommentMetadata(comment, input.userId);
          
          // Add replies if requested
          if (input.includeReplies) {
            const commentReplies = replies.filter(reply => reply.parentCommentId === comment.id);
            metadata.replies = await Promise.all(
              commentReplies.map(reply => this.buildCommentMetadata(reply, input.userId))
            );
          }
          
          return metadata;
        })
      );

      // Sort comments by creation date (newest first)
      commentsWithMetadata.sort((a, b) => 
        b.comment.createdAt.getTime() - a.comment.createdAt.getTime()
      );

      return {
        success: true,
        comments: commentsWithMetadata
      };
    } catch (error) {
      console.error('Error in ListPostCommentsUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async buildCommentMetadata(comment: Comment, userId: string): Promise<CommentWithMetadata> {
    // Get likes count and user's like status
    const [likesCount, userLike] = await Promise.all([
      this.commentLikeRepository.countByComment(comment.id),
      this.commentLikeRepository.findByUserAndComment(userId, comment.id)
    ]);

    return {
      comment,
      likesCount,
      isLikedByUser: !!userLike
    };
  }

  private validateInput(input: ListPostCommentsInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
