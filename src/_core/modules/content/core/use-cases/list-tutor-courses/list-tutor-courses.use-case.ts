import { inject, injectable } from 'inversify';
import type { ListTutorCoursesInput } from './list-tutor-courses.input';
import type { ListTutorCoursesOutput } from './list-tutor-courses.output';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import { Register } from '../../../../../shared/container/symbols';
import { Course } from '../../entities/Course';
import { CourseTutor } from '../../entities/CourseTutor';

@injectable()
export class ListTutorCoursesUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(Register.content.repository.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  async execute(input: ListTutorCoursesInput): Promise<ListTutorCoursesOutput> {
    const tutorCourses = await this.courseTutorRepository.findByUserId(input.tutorId);
    
    const courses = await Promise.all(
      tutorCourses.map((tutorCourse: CourseTutor) => this.courseRepository.findById(tutorCourse.courseId))
    );

    const filteredCourses = courses.filter((course: Course | null): course is Course => course !== null);

    return { courses: filteredCourses };
  }
}
