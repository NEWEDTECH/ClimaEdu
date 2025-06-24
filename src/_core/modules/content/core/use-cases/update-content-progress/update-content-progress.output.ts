import { LessonProgress } from '../../entities/LessonProgress';

/**
 * Output for UpdateContentProgressUseCase
 */
export interface UpdateContentProgressOutput {
  /**
   * The updated lesson progress
   */
  lessonProgress: LessonProgress;

  /**
   * Indicates if the lesson was completed as a result of this update
   */
  lessonCompleted: boolean;

  /**
   * Indicates if the specific content was completed as a result of this update
   */
  contentCompleted: boolean;
}
