import { EnrollmentStatus } from '../../entities/EnrollmentStatus';

/**
 * Input data for listing enrollments
 */
export interface ListEnrollmentsInput {
  /**
   * Optional user ID to filter enrollments by user
   */
  userId?: string;

  /**
   * Optional course ID to filter enrollments by course
   */
  courseId?: string;

  /**
   * Optional status to filter enrollments by status
   */
  status?: EnrollmentStatus;
}
