import { injectable, inject } from 'inversify';
import { ContentSymbols } from '../../../../../shared/container/modules/content/symbols';
import type { CourseTutorRepository } from '../../../infrastructure/repositories/CourseTutorRepository';
import { ListCourseTutorsInput } from './list-course-tutors.input';
import { ListCourseTutorsOutput } from './list-course-tutors.output';

/**
 * Use case for listing tutors associated with a course
 * Following Clean Architecture principles, this use case is pure and infrastructure-agnostic
 */
@injectable()
export class ListCourseTutorsUseCase {
  constructor(
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input parameters with courseId
   * @returns Promise with the list of course tutors
   */
  async execute(input: ListCourseTutorsInput): Promise<ListCourseTutorsOutput> {
    const tutors = await this.courseTutorRepository.findByCourseId(input.courseId);
    return new ListCourseTutorsOutput(tutors);
  }
}
