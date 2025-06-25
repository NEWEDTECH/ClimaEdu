import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import { PublishPostInput } from './publish-post.input';
import { PublishPostOutput } from './publish-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for publishing a post
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class PublishPostUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: PublishPostInput): Promise<PublishPostOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Find the post
      const post = await this.postRepository.findById(input.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user is the author
      if (post.authorId !== input.userId) {
        throw new Error('Only the author can publish the post');
      }

      // Check if post is in draft status
      if (!post.isDraft()) {
        throw new Error('Only draft posts can be published');
      }

      // Publish the post
      post.publish();

      // Save the published post
      const savedPost = await this.postRepository.save(post);

      return {
        success: true,
        post: savedPost
      };
    } catch (error) {
      console.error('Error in PublishPostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: PublishPostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
