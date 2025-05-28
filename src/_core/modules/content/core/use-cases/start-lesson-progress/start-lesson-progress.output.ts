import { LessonProgress } from '../../entities/LessonProgress';

/**
 * Output for StartLessonProgressUseCase
 */
export interface StartLessonProgressOutput {
  /**
   * The lesson progress that was created or retrieved
   */
  lessonProgress: LessonProgress;

  /**
   * Indicates if this is a new lesson progress (true) or existing one (false)
   */
  isNew: boolean;
}
