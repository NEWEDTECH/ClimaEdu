import { injectable, inject } from 'inversify';
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository';
import { Register } from '@/_core/shared/container/symbols';
import { CreateContentInput } from './create-content.input';
import { CreateContentOutput } from './create-content.output';
import { Content } from '../../../core/entities/Content';

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
    // Generate a new ID
    const id = await this.contentRepository.generateId();
    
    // Create content entity
    const content = Content.create({
      id,
      lessonId: input.lessonId,
      title: input.title,
      type: input.type,
      url: input.url,
    });

    // Save content
    const savedContent = await this.contentRepository.save(content);

    return { content: savedContent };
  }
}
