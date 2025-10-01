/**
 * Input data for listing tutor courses with their students
 */
export interface ListTutorCoursesWithStudentsInput {
  /**
   * The tutor's user ID
   */
  tutorId: string;

  /**
   * The institution ID to filter courses
   */
  institutionId: string;
}
