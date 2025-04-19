import { injectable, inject } from 'inversify';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import type { ModuleRepository } from '../../../infrastructure/repositories/ModuleRepository';
import { Register } from '@/_core/shared/container';
import { CreateLessonInput } from './create-lesson.input';
import { CreateLessonOutput } from './create-lesson.output';

/**
 * Use case for creating a lesson
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class CreateLessonUseCase {
  constructor(
    @inject(Register.content.repository.LessonRepository)
    private lessonRepository: LessonRepository,
    
    @inject(Register.content.repository.ModuleRepository)
    private moduleRepository: ModuleRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if module not found or validation fails
   */
  async execute(input: CreateLessonInput): Promise<CreateLessonOutput> {
    // Verify that the module exists
    const existingModule = await this.moduleRepository.findById(input.moduleId);
    if (!existingModule) {
      throw new Error(`Module with ID ${input.moduleId} not found`);
    }

    // Determine the order for the new lesson
    let lessonOrder: number;
    
    if (input.order !== undefined) {
      // If order is provided, use it and reorder other lessons if needed
      lessonOrder = input.order;
      
      // Reorder existing lessons to make room for the new one
      await this.lessonRepository.reorderLessons(input.moduleId, lessonOrder);
    } else {
      // If order is not provided, add the lesson at the end
      const lessonCount = await this.lessonRepository.countByModule(input.moduleId);
      lessonOrder = lessonCount;
    }

    // Create lesson
    const createdLesson = await this.lessonRepository.create({
      moduleId: input.moduleId,
      title: input.title,
      order: lessonOrder,
    });

    return { lesson: createdLesson };
  }
}
