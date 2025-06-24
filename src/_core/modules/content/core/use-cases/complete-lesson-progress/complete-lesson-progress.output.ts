import { LessonProgress } from '../../entities/LessonProgress';

/**
 * Output for CompleteLessonProgressUseCase
 */
export interface CompleteLessonProgressOutput {
  /**
   * The completed lesson progress
   */
  lessonProgress: LessonProgress;

  /**
   * Indicates if the lesson was already completed before this operation
   */
  wasAlreadyCompleted: boolean;
}
