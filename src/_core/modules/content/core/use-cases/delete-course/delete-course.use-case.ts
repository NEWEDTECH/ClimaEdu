import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import { DeleteCourseInput } from './delete-course.input';
import { DeleteCourseOutput } from './delete-course.output';

/**
 * Use case for deleting a course completely
 * This includes deleting all tutor/content manager associations
 * Following Clean Architecture principles
 */
@injectable()
export class DeleteCourseUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.content.repository.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input with courseId
   * @returns Output with success status
   * @throws Error if course not found
   */
  async execute(input: DeleteCourseInput): Promise<DeleteCourseOutput> {
    // Verify if the course exists
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Delete all tutor/content manager associations for this course
    const associations = await this.courseTutorRepository.findByCourseId(input.courseId);
    
    for (const association of associations) {
      await this.courseTutorRepository.delete(association.id);
    }

    // Delete the course itself
    const success = await this.courseRepository.delete(input.courseId);

    return new DeleteCourseOutput(success);
  }
}
