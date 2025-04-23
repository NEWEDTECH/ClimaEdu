import { Enrollment } from '../../entities/Enrollment';

/**
 * Output data for canceling an enrollment
 */
export interface CancelEnrollmentOutput {
  /**
   * The updated enrollment with cancelled status
   */
  enrollment: Enrollment;
}
