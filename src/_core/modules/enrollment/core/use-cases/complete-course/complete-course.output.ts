import { Enrollment } from '../../entities/Enrollment';
import { Certificate } from '@/_core/modules/certificate';

/**
 * Output for completing a course
 */
export interface CompleteCourseOutput {
  enrollment: Enrollment;
  certificate: Certificate;
  wasAlreadyCompleted: boolean;
}