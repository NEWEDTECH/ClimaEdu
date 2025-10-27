import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { ModuleRepository } from '../../../infrastructure/repositories/ModuleRepository';
import type { LessonRepository } from '../../../infrastructure/repositories/LessonRepository';
import { DeleteModuleInput } from './delete-module.input';
import { DeleteModuleOutput } from './delete-module.output';

/**
 * Use case for deleting a module completely
 * This includes deleting all lessons within the module
 * Following Clean Architecture principles
 */
@injectable()
export class DeleteModuleUseCase {
  constructor(
    @inject(Register.content.repository.ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input with moduleId
   * @returns Output with success status
   * @throws Error if module not found
   */
  async execute(input: DeleteModuleInput): Promise<DeleteModuleOutput> {
    // Verify if the module exists
    const moduleEntity = await this.moduleRepository.findById(input.moduleId);
    if (!moduleEntity) {
      throw new Error('Module not found');
    }

    // Delete all lessons in this module
    const lessons = await this.lessonRepository.listByModule(input.moduleId);
    
    for (const lesson of lessons) {
      await this.lessonRepository.delete(lesson.id);
    }

    // Delete the module itself
    const success = await this.moduleRepository.delete(input.moduleId);

    return new DeleteModuleOutput(success);
  }
}
