import { injectable, inject } from 'inversify';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { CreateCourseInput } from './create-course.input';
import { CreateCourseOutput } from './create-course.output';
import { Course } from '../../entities/Course';

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
    // Generate ID and create course entity
    const id = await this.courseRepository.generateId();
    const course = Course.create({
      id,
      institutionId: input.institutionId,
      title: input.title,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
    });

    // Save the course
    const savedCourse = await this.courseRepository.save(course);

    return { course: savedCourse };
  }
}
