import { Course } from '../../../core/entities/Course';

/**
 * Output data for listing courses where a user is a tutor within an institution
 */
export interface ListTutorCoursesOutput {
  courses: Course[];
}
