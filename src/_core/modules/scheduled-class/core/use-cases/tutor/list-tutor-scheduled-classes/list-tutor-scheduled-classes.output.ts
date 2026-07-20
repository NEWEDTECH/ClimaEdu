import { ScheduledClass } from '../../../entities/ScheduledClass';

/**
 * Output for ListTutorScheduledClassesUseCase
 */
export interface ListTutorScheduledClassesOutput {
  scheduledClasses: ScheduledClass[];
}
