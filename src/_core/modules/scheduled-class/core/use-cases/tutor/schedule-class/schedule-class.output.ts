import { ScheduledClass } from '../../../entities/ScheduledClass';

/**
 * Output for ScheduleClassUseCase
 */
export interface ScheduleClassOutput {
  scheduledClass: ScheduledClass;
  success: boolean;
  message: string;
}
