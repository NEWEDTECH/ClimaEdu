import { injectable, inject } from 'inversify';
import type { ModuleRepository } from '../../../infrastructure/repositories/ModuleRepository';
import type { CourseRepository } from '../../../infrastructure/repositories/CourseRepository';
import { Register } from '@/_core/shared/container';
import { CreateModuleInput } from './create-module.input';
import { CreateModuleOutput } from './create-module.output';

/**
 * Use case for creating a module
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class CreateModuleUseCase {
  constructor(
    @inject(Register.content.repository.ModuleRepository)
    private moduleRepository: ModuleRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private courseRepository: CourseRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if course not found or validation fails
   */
  async execute(input: CreateModuleInput): Promise<CreateModuleOutput> {
    // Verify that the course exists
    const course = await this.courseRepository.findById(input.courseId);
    if (!course) {
      throw new Error(`Course with ID ${input.courseId} not found`);
    }

    // Create module
    const createdModule = await this.moduleRepository.create({
      courseId: input.courseId,
      title: input.title,
      order: input.order,
    });

    return { module: createdModule };
  }
}
