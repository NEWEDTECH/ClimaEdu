/**
 * Input for UpdateContentProgressUseCase
 */
export interface UpdateContentProgressInput {
  /**
   * ID of the user updating the progress
   */
  userId: string;

  /**
   * ID of the lesson containing the content
   */
  lessonId: string;

  /**
   * ID of the content being updated
   */
  contentId: string;

  /**
   * Progress percentage (0-100)
   */
  progressPercentage: number;

  /**
   * Additional time spent on this content (in seconds)
   * Optional - if not provided, time won't be updated
   */
  timeSpent?: number;

  /**
   * Last position for video/audio content (in seconds)
   * Optional - only relevant for media content
   */
  lastPosition?: number;
}
