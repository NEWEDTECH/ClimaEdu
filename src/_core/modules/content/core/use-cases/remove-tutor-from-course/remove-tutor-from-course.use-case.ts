import { injectable, inject } from 'inversify';
import { ContentSymbols } from '../../../../../shared/container/modules/content/symbols';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import { RemoveTutorFromCourseInput } from './remove-tutor-from-course.input';
import { RemoveTutorFromCourseOutput } from './remove-tutor-from-course.output';

/**
 * Use case for removing a tutor from a course
 * Following Clean Architecture principles, this use case is pure and infrastructure-agnostic
 */
@injectable()
export class RemoveTutorFromCourseUseCase {
  constructor(
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input parameters with userId and courseId
   * @returns Promise with success status
   */
  async execute(input: RemoveTutorFromCourseInput): Promise<RemoveTutorFromCourseOutput> {
    // Find the association
    const association = await this.courseTutorRepository.findByUserAndCourse(
      input.userId,
      input.courseId
    );

    if (!association) {
      throw new Error('Course-Tutor association not found');
    }

    // Delete the association
    const success = await this.courseTutorRepository.delete(association.id);

    return new RemoveTutorFromCourseOutput(success);
  }
}
