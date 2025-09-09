import { injectable, inject } from 'inversify';
import type { LessonProgressRepository } from '../../../infrastructure/repositories/LessonProgressRepository';
import type { CompleteLessonProgressInput } from './complete-lesson-progress.input';
import type { CompleteLessonProgressOutput } from './complete-lesson-progress.output';
import { Register } from '@/_core/shared/container';
import type { EventBus } from '@/_core/shared/events/interfaces/EventBus';
import { LessonCompletedEvent } from '@/_core/modules/achievement/core/events/LessonCompletedEvent';

/**
 * Use case for forcefully completing lesson progress
 * Marks all contents as completed and sets the lesson as completed
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class CompleteLessonProgressUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.shared.service.EventBus)
    private eventBus: EventBus
  ) {}

  /**
   * Executes the complete lesson progress use case
   * @param input CompleteLessonProgressInput
   * @returns CompleteLessonProgressOutput
   * @throws Error if validation fails or lesson progress is not found
   */
  async execute(input: CompleteLessonProgressInput): Promise<CompleteLessonProgressOutput> {
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

    // Check if lesson was already completed
    const wasAlreadyCompleted = lessonProgress.isCompleted();

    // Complete the lesson using content-type-specific logic if provided
    if (input.contentTypesMap) {
      lessonProgress.completeWithContentTypeLogic(input.contentTypesMap);
    } else {
      // Fallback to force complete (marks all contents as 100%)
      lessonProgress.forceComplete();
    }

    // Save the updated lesson progress
    console.log('🔎 Saving completed lesson progress:', lessonProgress);
    const savedProgress = await this.lessonProgressRepository.save(lessonProgress);

    // Publish event if lesson was completed and wasn't already completed
    if (savedProgress.isCompleted() && !wasAlreadyCompleted) {
      try {
        const lessonCompletedEvent = LessonCompletedEvent.create({
          userId: savedProgress.userId,
          institutionId: savedProgress.institutionId,
          lessonId: savedProgress.lessonId,
          moduleId: input.moduleId || '', // Module ID should be provided in input
          courseId: input.courseId || '', // Course ID should be provided in input
          completionTime: savedProgress.getTotalTimeSpent(),
          score: savedProgress.calculateOverallProgress()
        });

        await this.eventBus.publish(lessonCompletedEvent);
        console.log('🎯 LessonCompletedEvent published for lesson:', savedProgress.lessonId);
      } catch (error) {
        console.error('Failed to publish LessonCompletedEvent:', error);
        // Don't fail the use case if event publishing fails
      }
    }

    return {
      lessonProgress: savedProgress,
      wasAlreadyCompleted
    };
  }

  /**
   * Validates the input parameters
   * @param input CompleteLessonProgressInput
   * @throws Error if validation fails
   */
  private validateInput(input: CompleteLessonProgressInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.lessonId || input.lessonId.trim() === '') {
      throw new Error('Lesson ID is required');
    }
  }
}
