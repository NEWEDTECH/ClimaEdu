import { injectable, inject } from 'inversify';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { UpdateContentProgressInput } from './update-content-progress.input';
import type { UpdateContentProgressOutput } from './update-content-progress.output';
import { Register } from '@/_core/shared/container';

/**
 * Use case for updating content progress within a lesson
 * Updates the progress of a specific content and automatically updates lesson completion status
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class UpdateContentProgressUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository) private lessonProgressRepository: LessonProgressRepository
  ) {}

  /**
   * Executes the update content progress use case
   * @param input UpdateContentProgressInput
   * @returns UpdateContentProgressOutput
   * @throws Error if validation fails or lesson progress is not found
   */
  async execute(input: UpdateContentProgressInput): Promise<UpdateContentProgressOutput> {
    // Validate input
    this.validateInput(input);

    // Find existing lesson progress
    const lessonProgress = await this.lessonProgressRepository.findByUserAndLesson(
      input.userId,
      input.lessonId
    );

    if (!lessonProgress) {
      throw new Error(
        `Lesson progress not found for user ${input.userId} and lesson ${input.lessonId}. ` +
        'Please start the lesson first.'
      );
    }

    // Get current content progress to check if it was already completed
    const contentProgress = lessonProgress.getContentProgress(input.contentId);
    if (!contentProgress) {
      throw new Error(
        `Content ${input.contentId} not found in lesson progress ${lessonProgress.id}`
      );
    }

    const wasContentCompleted = contentProgress.isCompleted();
    const wasLessonCompleted = lessonProgress.isCompleted();

    // Update content progress
    lessonProgress.updateContentProgress(
      input.contentId,
      input.progressPercentage,
      input.timeSpent,
      input.lastPosition
    );

    // Save the updated lesson progress
    const savedProgress = await this.lessonProgressRepository.save(lessonProgress);

    // Check completion status changes
    const isContentCompleted = contentProgress.isCompleted();
    const isLessonCompleted = savedProgress.isCompleted();

    const contentCompleted = !wasContentCompleted && isContentCompleted;
    const lessonCompleted = !wasLessonCompleted && isLessonCompleted;

    return {
      lessonProgress: savedProgress,
      lessonCompleted,
      contentCompleted
    };
  }

  /**
   * Validates the input parameters
   * @param input UpdateContentProgressInput
   * @throws Error if validation fails
   */
  private validateInput(input: UpdateContentProgressInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }

    if (!input.contentId || input.contentId.trim() === '') {
      throw new Error('Content ID is required');
    }

    if (input.progressPercentage < 0 || input.progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    if (input.timeSpent !== undefined && input.timeSpent < 0) {
      throw new Error('Time spent cannot be negative');
    }

    if (input.lastPosition !== undefined && input.lastPosition < 0) {
      throw new Error('Last position cannot be negative');
    }
  }
}
