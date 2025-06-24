import { injectable, inject } from 'inversify';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { ListTutorCoursesInput } from './list-tutor-courses.input';
import { ListTutorCoursesOutput } from './list-tutor-courses.output';
import { Course } from '../../../core/entities/Course';
import { UserRole } from '@/_core/modules/user/core/entities/User';

/**
 * Use case for listing courses where a user is a tutor within an institution
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class ListTutorCoursesUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private userRepository: UserRepository,
    
    @inject(Register.content.repository.CourseTutorRepository)
    private courseTutorRepository: CourseTutorRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private courseRepository: CourseRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if validation fails
   */
  async execute(input: ListTutorCoursesInput): Promise<ListTutorCoursesOutput> {
    // Verify if the user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify if the user is a tutor
    if (user.role !== UserRole.TUTOR) {
      throw new Error('User must be a tutor to list tutor courses');
    }

    // Find all course-tutor associations for this user
    const courseTutors = await this.courseTutorRepository.findByUserId(input.userId);
    
    // If no associations found, return empty array
    if (courseTutors.length === 0) {
      return { courses: [] };
    }

    // Get course IDs from associations
    const courseIds = courseTutors.map(ct => ct.courseId);
    
    // Fetch all courses
    const courses: Course[] = [];
    
    // For each course ID, fetch the course details and filter by institution
    for (const courseId of courseIds) {
      const course = await this.courseRepository.findById(courseId);
      if (course && course.institutionId === input.institutionId) {
        courses.push(course);
      }
    }

    return { courses };
  }
}
