import { Activity } from '../../entities/Activity';
import { Lesson } from '../../entities/Lesson';

/**
 * Output data for creating an activity
 */
export interface CreateActivityOutput {
  activity: Activity;
  lesson: Lesson;
}
