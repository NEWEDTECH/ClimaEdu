/**
 * Input data for enrolling a user in a course
 */
export interface EnrollInCourseInput {
  /**
   * The ID of the user to enroll
   */
  userId: string;

  /**
   * The ID of the course to enroll in
   */
  courseId: string;

  /**
   * The ID of the institution where the enrollment takes place
   */
  institutionId: string;
}
