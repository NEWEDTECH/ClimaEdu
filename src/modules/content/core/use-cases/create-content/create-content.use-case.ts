import { injectable, inject } from 'inversify';
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository';
import { Register } from '@/shared/container/symbols';
import { CreateContentInput } from './create-content.input';
import { CreateContentOutput } from './create-content.output';

/**
 * Use case for creating content
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreateContentUseCase {
  constructor(
    @inject(Register.content.repository.ContentRepository)
    private contentRepository: ContentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: CreateContentInput): Promise<CreateContentOutput> {
    // Create content
    const content = await this.contentRepository.create({
      title: input.title,
      description: input.description,
      type: input.type,
      url: input.url,
      categories: input.categories,
      authorId: input.authorId,
    });

    return { content };
  }
}
