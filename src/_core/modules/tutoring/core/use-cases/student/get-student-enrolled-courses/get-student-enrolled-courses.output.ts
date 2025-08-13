import { Course } from '@/_core/modules/content'

/**
 * Output data for getting student enrolled courses for tutoring
 */
export interface GetStudentEnrolledCoursesOutput {
  /**
   * List of courses the student is enrolled in
   */
  courses: Course[];
}
