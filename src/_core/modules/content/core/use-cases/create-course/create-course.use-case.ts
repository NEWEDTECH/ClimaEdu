import { injectable, inject } from 'inversify';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { CreateCourseInput } from './create-course.input';
import { CreateCourseOutput } from './create-course.output';

/**
 * Use case for creating a course
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreateCourseUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private courseRepository: CourseRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: CreateCourseInput): Promise<CreateCourseOutput> {
    // Create course
    const course = await this.courseRepository.create({
      institutionId: input.institutionId,
      title: input.title,
      description: input.description,
    });

    return { course };
  }
}
