import { injectable, inject } from 'inversify';
import type { EnrollmentRepository } from '../../../infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import type { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { EnrollInCourseInput } from './enroll-in-course.input';
import { EnrollInCourseOutput } from './enroll-in-course.output';
import { Enrollment } from '../../entities/Enrollment';
import { EnrollmentStatus } from '../../entities/EnrollmentStatus';

/**
 * Use case for enrolling a user in a course
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class EnrollInCourseUseCase {
  constructor(
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.user.repository.UserRepository)
    private userRepository: UserRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private courseRepository: CourseRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if user or course not found, or if user is already enrolled
   */
  async execute(input: EnrollInCourseInput): Promise<EnrollInCourseOutput> {
    // Verify that the user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    // Verify that the course exists
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) {
      throw new Error(`Course with ID ${input.courseId} not found`);
    }

    // Check if the user is already enrolled in the course
    const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
      input.userId,
      input.courseId
    );

    if (existingEnrollment) {
      // If the enrollment exists but is cancelled, reactivate it
      if (existingEnrollment.status === EnrollmentStatus.CANCELLED) {
        existingEnrollment.reactivate();
        const savedEnrollment = await this.enrollmentRepository.save(existingEnrollment);
        return { enrollment: savedEnrollment };
      }
      
      // Otherwise, the user is already enrolled
      throw new Error(`User is already enrolled in this course`);
    }

    // Generate a new enrollment ID
    const enrollmentId = await this.enrollmentRepository.generateId();

    // Create a new enrollment
    const enrollment = Enrollment.create({
      id: enrollmentId,
      userId: input.userId,
      courseId: input.courseId,
      status: EnrollmentStatus.ENROLLED,
      enrolledAt: new Date()
    });

    // Save the enrollment
    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    return {
      enrollment: savedEnrollment
    };
  }
}
