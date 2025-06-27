import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { ListPostsInput } from './list-posts.input';
import { ListPostsOutput, PostWithMetadata } from './list-posts.output';
import { PostStatus } from '../../entities/Post';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for listing posts with metadata
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class ListPostsUseCase {
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
  async execute(input: ListPostsInput): Promise<ListPostsOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Get posts based on filters
      let posts;
      
      if (input.authorId) {
        // Get posts by specific author
        posts = await this.postRepository.findByAuthor(input.authorId, input.institutionId);
      } else {
        // Get posts by institution and status
        const status = input.status || PostStatus.PUBLISHED;
        posts = await this.postRepository.findByInstitution(input.institutionId, status);
      }

      // Apply limit if specified
      if (input.limit && input.limit > 0) {
        posts = posts.slice(0, input.limit);
      }

      // For non-authors, filter out non-published posts
      if (!input.authorId || input.authorId !== input.userId) {
        posts = posts.filter(post => post.isPublished());
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

      return {
        success: true,
        posts: postsWithMetadata
      };
    } catch (error) {
      console.error('Error in ListPostsUseCase:', error);
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

  private validateInput(input: ListPostsInput): void {
    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (input.limit !== undefined && input.limit < 0) {
      throw new Error('Limit must be a positive number');
    }
  }
}
