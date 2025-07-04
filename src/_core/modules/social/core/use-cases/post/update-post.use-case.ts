import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import { UpdatePostInput } from './update-post.input';
import { UpdatePostOutput } from './update-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for updating a post
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdatePostUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: UpdatePostInput): Promise<UpdatePostOutput> {
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
        throw new Error('Only the author can update the post');
      }

      // Check if post is in draft status (only drafts can be updated)
      if (!post.isDraft()) {
        throw new Error('Only draft posts can be updated');
      }

      // Update the post content if provided
      if (input.title !== undefined || input.content !== undefined) {
        const newTitle = input.title !== undefined ? input.title : post.title;
        const newContent = input.content !== undefined ? input.content : post.content;
        
        post.updateContent(newTitle, newContent);
      }

      // Save the updated post
      const savedPost = await this.postRepository.save(post);

      return {
        success: true,
        post: savedPost
      };
    } catch (error) {
      console.error('Error in UpdatePostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: UpdatePostInput): void {
    if (!input.postId || input.postId.trim().length === 0) {
      throw new Error('Post ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    // At least one field must be provided for update
    if (input.title === undefined && input.content === undefined) {
      throw new Error('At least title or content must be provided for update');
    }
  }
}
