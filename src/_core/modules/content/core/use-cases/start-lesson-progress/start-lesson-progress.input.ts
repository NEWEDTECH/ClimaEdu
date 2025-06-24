/**
 * Input for StartLessonProgressUseCase
 */
export interface StartLessonProgressInput {
  /**
   * ID of the user starting the lesson
   */
  userId: string;

  /**
   * ID of the lesson to start
   */
  lessonId: string;

  /**
   * ID of the institution
   */
  institutionId: string;
}
