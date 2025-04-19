import { injectable, inject } from 'inversify';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { UpdateCourseInput } from './update-course.input';
import { UpdateCourseOutput } from './update-course.output';

/**
 * Use case for updating a course
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdateCourseUseCase {
  constructor(
    @inject(Register.content.repository.CourseRepository)
    private courseRepository: CourseRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if course not found
   */
  async execute(input: UpdateCourseInput): Promise<UpdateCourseOutput> {
    // Find the course by ID
    const course = await this.courseRepository.findById(input.id);
    if (!course) {
      throw new Error(`Course with ID ${input.id} not found`);
    }

    // Prepare update data
    const updateData: Partial<{
      title: string;
      description: string;
    }> = {};

    // Only include fields that are provided in the input
    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    // Update the course
    const updatedCourse = await this.courseRepository.update(input.id, updateData);

    return { course: updatedCourse };
  }
}
