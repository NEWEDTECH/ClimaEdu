import type { CourseTutor } from '../../entities/CourseTutor';

/**
 * Output data for listing course tutors
 */
export class ListCourseTutorsOutput {
  constructor(public readonly tutors: CourseTutor[]) {}
}
