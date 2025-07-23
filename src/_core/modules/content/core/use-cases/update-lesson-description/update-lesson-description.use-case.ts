import { injectable, inject } from 'inversify';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { Register } from '@/_core/shared/container';
import { UpdateLessonDescriptionInput } from './update-lesson-description.input';
import { UpdateLessonDescriptionOutput } from './update-lesson-description.output';

/**
 * Use case for updating a lesson description
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdateLessonDescriptionUseCase {
  constructor(
    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if lesson not found
   */
  async execute(input: UpdateLessonDescriptionInput): Promise<UpdateLessonDescriptionOutput> {
    // Find the lesson by ID
    const lesson = await this.lessonRepository.findById(input.lessonId);
    if (!lesson) {
      throw new Error(`Lesson with ID ${input.lessonId} not found`);
    }

    // Update the lesson description using the entity method
    lesson.updateDescription(input.description);

    // Save the updated lesson
    const updatedLesson = await this.lessonRepository.save(lesson);

    return { lesson: updatedLesson };
  }
}
