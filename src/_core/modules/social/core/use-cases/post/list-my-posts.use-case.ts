import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { ListMyPostsInput } from './list-my-posts.input';
import { ListMyPostsOutput } from './list-my-posts.output';
import { PostWithMetadata } from './list-posts.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for listing user's own posts with metadata
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class ListMyPostsUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository,
    @inject(Register.social.repository.PostLikeRepository)
    private postLikeRepository: PostLikeRepository,
    @inject(Register.social.repository.CommentRepository)
    private commentRepository: CommentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ListMyPostsInput): Promise<ListMyPostsOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Get user's posts
      let posts = await this.postRepository.findByAuthor(input.userId, input.institutionId);

      // Filter by status if specified
      if (input.status) {
        posts = posts.filter(post => post.status === input.status);
      }

      // Apply limit if specified
      if (input.limit && input.limit > 0) {
        posts = posts.slice(0, input.limit);
      }

      // Enrich posts with metadata
      const postsWithMetadata: PostWithMetadata[] = await Promise.all(
        posts.map(async (post) => {
          // Get likes count and user's like status
          const [likesCount, userLike, commentsCount] = await Promise.all([
            this.postLikeRepository.countByPost(post.id),
            this.postLikeRepository.findByUserAndPost(input.userId, post.id),
            this.getCommentsCount(post.id)
          ]);

          return {
            post,
            likesCount,
            isLikedByUser: !!userLike,
            commentsCount
          };
        })
      );

      // Sort posts by creation date (newest first)
      postsWithMetadata.sort((a, b) => 
        b.post.createdAt.getTime() - a.post.createdAt.getTime()
      );

      return {
        success: true,
        posts: postsWithMetadata
      };
    } catch (error) {
      console.error('Error in ListMyPostsUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async getCommentsCount(postId: string): Promise<number> {
    try {
      const comments = await this.commentRepository.findByPost(postId);
      return comments.length;
    } catch (error) {
      console.error('Error counting comments:', error);
      return 0;
    }
  }

  private validateInput(input: ListMyPostsInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }

    if (input.limit !== undefined && input.limit < 0) {
      throw new Error('Limit must be a positive number');
    }
  }
}
