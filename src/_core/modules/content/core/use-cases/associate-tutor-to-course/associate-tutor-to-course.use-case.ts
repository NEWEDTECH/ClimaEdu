import { injectable, inject } from 'inversify';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { AssociateTutorToCourseInput } from './associate-tutor-to-course.input';
import { AssociateTutorToCourseOutput } from './associate-tutor-to-course.output';
import { CourseTutor } from '../../../core/entities/CourseTutor';
import { UserRole } from '@/_core/modules/user/core/entities/User';

/**
 * Use case for associating a tutor to a course
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class AssociateTutorToCourseUseCase {
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
  async execute(input: AssociateTutorToCourseInput): Promise<AssociateTutorToCourseOutput> {
    // Verify if the user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify if the user is a tutor
    if (user.role !== UserRole.TUTOR) {
      throw new Error('User must be a tutor to be associated with a course');
    }

    // Verify if the course exists
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if the association already exists
    const existingAssociation = await this.courseTutorRepository.findByUserAndCourse(
      input.userId,
      input.courseId
    );
    
    if (existingAssociation) {
      return { courseTutor: existingAssociation };
    }

    // Create a new association
    const id = await this.courseTutorRepository.generateId();
    const courseTutor = CourseTutor.create({
      id,
      userId: input.userId,
      courseId: input.courseId
    });

    // Save the association
    const savedCourseTutor = await this.courseTutorRepository.save(courseTutor);

    return { courseTutor: savedCourseTutor };
  }
}
