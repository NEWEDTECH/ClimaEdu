import { Enrollment } from '../../entities/Enrollment';

/**
 * Output data for enrolling a user in a course
 */
export interface EnrollInCourseOutput {
  /**
   * The created enrollment
   */
  enrollment: Enrollment;
}
