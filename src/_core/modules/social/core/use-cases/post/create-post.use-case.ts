import { injectable, inject } from 'inversify';
import type { PostRepository } from '../../../infrastructure/repositories/PostRepository';
import { Post } from '../../entities/Post';
import { CreatePostInput } from './create-post.input';
import { CreatePostOutput } from './create-post.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for creating a new post
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreatePostUseCase {
  constructor(
    @inject(Register.social.repository.PostRepository)
    private postRepository: PostRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: CreatePostInput): Promise<CreatePostOutput> {
    try {
      // Validate input
      this.validateInput(input);

      // Generate ID for the new post
      const id = await this.postRepository.generateId();

      // Create the post entity
      const post = Post.create({
        id,
        authorId: input.authorId,
        institutionId: input.institutionId,
        title: input.title,
        content: input.content
      });

      // Save the post
      const savedPost = await this.postRepository.save(post);

      return {
        success: true,
        post: savedPost
      };
    } catch (error) {
      console.error('Error in CreatePostUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateInput(input: CreatePostInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Post title is required');
    }

    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Post content is required');
    }

    if (!input.authorId || input.authorId.trim().length === 0) {
      throw new Error('Author ID is required');
    }

    if (!input.institutionId || input.institutionId.trim().length === 0) {
      throw new Error('Institution ID is required');
    }
  }
}
