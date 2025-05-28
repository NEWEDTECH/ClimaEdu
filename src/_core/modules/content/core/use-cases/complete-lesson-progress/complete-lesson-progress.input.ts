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
}
