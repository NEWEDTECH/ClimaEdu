import { injectable, inject } from 'inversify';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { GetLessonProgressInput } from './get-lesson-progress.input';
import type { GetLessonProgressOutput } from './get-lesson-progress.output';

/**
 * Use case for retrieving lesson progress
 * Returns the progress of a specific lesson for a user
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class GetLessonProgressUseCase {
  constructor(
    @inject('LessonProgressRepository') private lessonProgressRepository: LessonProgressRepository
  ) {}

  /**
   * Executes the get lesson progress use case
   * @param input GetLessonProgressInput
   * @returns GetLessonProgressOutput
   * @throws Error if validation fails
   */
  async execute(input: GetLessonProgressInput): Promise<GetLessonProgressOutput> {
    // Validate input
    this.validateInput(input);

    // Find lesson progress
    const lessonProgress = await this.lessonProgressRepository.findByUserAndLesson(
      input.userId,
      input.lessonId
    );

    return {
      lessonProgress
    };
  }

  /**
   * Validates the input parameters
   * @param input GetLessonProgressInput
   * @throws Error if validation fails
   */
  private validateInput(input: GetLessonProgressInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }
  }
}
