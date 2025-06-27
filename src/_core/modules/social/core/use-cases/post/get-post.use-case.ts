import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import type { PostLikeRepository } from '../../../infrastructure/repositories/PostLikeRepository';
import type { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { GetPostInput } from './get-post.input';
import { GetPostOutput, PostWithFullMetadata } from './get-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for getting a single post with metadata
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class GetPostUseCase {
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
  async execute(input: GetPostInput): Promise<GetPostOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the post
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check access permissions
      // If post is not published, only the author can see it
      if (!post.isPublished() && post.authorId !== input.userId) {
        throw new Error('Access denied - post is not published');
      }

      // Get metadata
      const [likesCount, userLike, commentsCount] = await Promise.all([
        this.postLikeRepository.countByPost(post.id),
        this.postLikeRepository.findByUserAndPost(input.userId, post.id),
        this.getCommentsCount(post.id)
      ]);

      const postData: PostWithFullMetadata = {
        post,
        likesCount,
        isLikedByUser: !!userLike,
        commentsCount
      };

      return {
        success: true,
        postData
      };
    } catch (error) {
      console.error('Error in GetPostUseCase:', error);
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

  private validateInput(input: GetPostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
