/**
 * Input for CanAccessLessonUseCase
 */
export interface CanAccessLessonInput {
  /**
   * ID of the user trying to access the lesson
   */
  userId: string;

  /**
   * ID of the lesson to check access for
   */
  lessonId: string;

  /**
   * ID of the institution to check navigation settings
   */
  institutionId: string;

  /**
   * ID of the course containing the lesson (for context)
   */
  courseId: string;
}