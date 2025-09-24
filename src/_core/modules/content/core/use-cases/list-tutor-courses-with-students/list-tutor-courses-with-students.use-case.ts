import { inject, injectable } from 'inversify';
import type { ListTutorCoursesWithStudentsInput } from './list-tutor-courses-with-students.input';
import type { ListTutorCoursesWithStudentsOutput, CourseWithStudents } from './list-tutor-courses-with-students.output';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import { Register } from '../../../../../shared/container/symbols';
import { Course } from '../../entities/Course';
import { CourseTutor } from '../../entities/CourseTutor';
import { Enrollment } from '../../../../enrollment/core/entities/Enrollment';
import { User } from '../../../../user/core/entities/User';

@injectable()
export class ListTutorCoursesWithStudentsUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    @inject(Register.content.repository.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository,
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: ListTutorCoursesWithStudentsInput): Promise<ListTutorCoursesWithStudentsOutput> {
    // Get courses where the user is a tutor
    const tutorCourses = await this.courseTutorRepository.findByUserId(input.tutorId);
    
    // Get course details
    const courses = await Promise.all(
      tutorCourses.map((tutorCourse: CourseTutor) => this.courseRepository.findById(tutorCourse.courseId))
    );

    const filteredCourses = courses.filter((course: Course | null): course is Course => 
      course !== null && course.institutionId === input.institutionId
    );

    // For each course, get enrolled students
    const coursesWithStudents: CourseWithStudents[] = await Promise.all(
      filteredCourses.map(async (course: Course) => {
        // Get enrollments for this course
        const enrollments = await this.enrollmentRepository.listByCourse(course.id);
        
        // Get student details
        const students = await Promise.all(
          enrollments.map((enrollment: Enrollment) => this.userRepository.findById(enrollment.userId))
        );

        const filteredStudents = students.filter((student: User | null): student is User => student !== null);

        return {
          course,
          students: filteredStudents,
          totalStudents: filteredStudents.length
        };
      })
    );

    // Calculate totals
    const totalCourses = coursesWithStudents.length;
    const totalStudents = coursesWithStudents.reduce((sum, courseWithStudents) => 
      sum + courseWithStudents.totalStudents, 0
    );

    return {
      coursesWithStudents,
      totalCourses,
      totalStudents
    };
  }
}
