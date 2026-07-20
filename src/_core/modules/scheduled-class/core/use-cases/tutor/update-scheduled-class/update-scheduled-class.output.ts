import { ScheduledClass } from '../../../entities/ScheduledClass';

/**
 * Output for UpdateScheduledClassUseCase
 */
export interface UpdateScheduledClassOutput {
  scheduledClass: ScheduledClass;
  success: boolean;
  message: string;
}
