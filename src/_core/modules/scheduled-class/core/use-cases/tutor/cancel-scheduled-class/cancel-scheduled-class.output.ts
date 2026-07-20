import { ScheduledClass } from '../../../entities/ScheduledClass';

/**
 * Output for CancelScheduledClassUseCase
 */
export interface CancelScheduledClassOutput {
  scheduledClass: ScheduledClass;
  success: boolean;
  message: string;
}
