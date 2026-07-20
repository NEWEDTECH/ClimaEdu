import { ScheduledClass } from '../../../entities/ScheduledClass';

/**
 * A scheduled class enriched with the class (turma) name for display
 */
export interface StudentScheduledClassItem {
  scheduledClass: ScheduledClass;
  className: string;
}

/**
 * Output for ListStudentScheduledClassesUseCase
 */
export interface ListStudentScheduledClassesOutput {
  items: StudentScheduledClassItem[];
}
