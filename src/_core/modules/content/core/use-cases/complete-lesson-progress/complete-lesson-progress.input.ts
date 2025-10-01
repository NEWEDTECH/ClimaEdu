import { ContentType } from '../../entities/ContentType';

/**
 * Input for CompleteLessonProgressUseCase
 */
export interface CompleteLessonProgressInput {
  /**
   * ID of the user completing the lesson
   */
  userId: string;

  /**
   * ID of the lesson to complete
   */
  lessonId: string;

  /**
   * ID of the module this lesson belongs to (required for achievement events)
   */
  moduleId?: string;

  /**
   * ID of the course this lesson belongs to (required for achievement events)
   */
  courseId?: string;

  /**
   * Optional map of content IDs to their types for content-type-specific completion logic
   * If not provided, will use forceComplete() behavior (all contents marked as 100%)
   */
  contentTypesMap?: Map<string, ContentType>;
}
