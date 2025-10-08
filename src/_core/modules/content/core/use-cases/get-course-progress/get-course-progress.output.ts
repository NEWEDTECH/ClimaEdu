/**
 * Output data for getting course progress
 */
export interface GetCourseProgressOutput {
  /**
   * The average progress percentage across all lessons in the course (0-100)
   */
  progressPercentage: number;

  /**
   * Total number of lessons in the course
   */
  totalLessons: number;

  /**
   * Number of completed lessons
   */
  completedLessons: number;

  /**
   * Number of lessons in progress
   */
  inProgressLessons: number;

  /**
   * Number of lessons not started
   */
  notStartedLessons: number;
}
