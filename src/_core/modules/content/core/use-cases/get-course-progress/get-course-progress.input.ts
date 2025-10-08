/**
 * Input data for getting course progress
 */
export interface GetCourseProgressInput {
  /**
   * The ID of the course
   */
  courseId: string;

  /**
   * The ID of the user (student)
   */
  userId: string;

  /**
   * The ID of the institution
   */
  institutionId: string;
}
