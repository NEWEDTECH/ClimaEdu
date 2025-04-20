import { injectable, inject } from 'inversify';
import type { ContentRepository } from '../../../infrastructure/repositories/ContentRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { Register } from '@/_core/shared/container';
import { AddContentToLessonInput } from './add-content-to-lesson.input';
import { AddContentToLessonOutput } from './add-content-to-lesson.output';
import { Content } from '../../../core/entities/Content';

/**
 * Use case for adding content to a lesson
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class AddContentToLessonUseCase {
  constructor(
    @inject(Register.content.repository.ContentRepository)
    private contentRepository: ContentRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if lesson not found or validation fails
   */
  async execute(input: AddContentToLessonInput): Promise<AddContentToLessonOutput> {
    // Verify that the lesson exists
    const existingLesson = await this.lessonRepository.findById(input.lessonId);
    if (!existingLesson) {
      throw new Error(`Lesson with ID ${input.lessonId} not found`);
    }

    // Generate a new ID for content
    const contentId = await this.contentRepository.generateId();
    
    // Create content entity
    const content = Content.create({
      id: contentId,
      lessonId: input.lessonId,
      type: input.type,
      title: input.title,
      url: input.url,
    });

    // Save content
    const savedContent = await this.contentRepository.save(content);

    // Add content to lesson in memory
    existingLesson.addContent(savedContent);

    // Persist the updated lesson with the content
    const updatedLesson = await this.lessonRepository.save(existingLesson);

    // Return both the created content and the updated lesson
    return {
      content: savedContent,
      lesson: updatedLesson,
    };
  }
}
