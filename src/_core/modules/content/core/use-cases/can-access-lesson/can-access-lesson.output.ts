/**
 * Output for CanAccessLessonUseCase
 */
export interface CanAccessLessonOutput {
  /**
   * Whether the user can access the lesson
   */
  canAccess: boolean;

  /**
   * Reason or message about lesson access (informative or restrictive)
   */
  reason?: string;

  /**
   * Whether the lesson has been started by the user
   */
  hasStarted: boolean;

  /**
   * Whether the lesson has been completed by the user
   */
  isCompleted: boolean;

  /**
   * Whether this lesson can be skipped (when accessing without completing prerequisites)
   */
  isSkippable?: boolean;
}