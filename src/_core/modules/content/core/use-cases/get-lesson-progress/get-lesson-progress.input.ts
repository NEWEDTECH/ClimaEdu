/**
 * Input for GetLessonProgressUseCase
 */
export interface GetLessonProgressInput {
  /**
   * ID of the user whose progress to retrieve
   */
  userId: string;

  /**
   * ID of the lesson to get progress for
   */
  lessonId: string;
}
