import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import { ArchivePostInput } from './archive-post.input';
import { ArchivePostOutput } from './archive-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for archiving a post
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class ArchivePostUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ArchivePostInput): Promise<ArchivePostOutput> {
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
        throw new Error('Only the author can archive the post');
      }

      // Check if post is published
      if (!post.isPublished()) {
        throw new Error('Only published posts can be archived');
      }

      // Archive the post
      post.archive();

      // Save the archived post
      const savedPost = await this.postRepository.save(post);

      return {
        success: true,
        post: savedPost
      };
    } catch (error) {
      console.error('Error in ArchivePostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: ArchivePostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
