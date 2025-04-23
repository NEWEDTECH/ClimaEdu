import { Enrollment } from '../../entities/Enrollment';

/**
 * Output data for listing enrollments
 */
export interface ListEnrollmentsOutput {
  /**
   * The list of enrollments
   */
  enrollments: Enrollment[];
}
