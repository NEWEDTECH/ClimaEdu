import { LessonProgress } from '../../entities/LessonProgress';

/**
 * Output for GetLessonProgressUseCase
 */
export interface GetLessonProgressOutput {
  /**
   * The lesson progress for the user and lesson
   * null if no progress exists (lesson not started)
   */
  lessonProgress: LessonProgress | null;
}
