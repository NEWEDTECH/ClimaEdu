import { inject, injectable } from 'inversify';
import { ScheduledClassSymbols } from '@/_core/shared/container/modules/scheduled-class/symbols';
import type { ScheduledClassRepository } from '../../../../infrastructure/repositories/ScheduledClassRepository';
import { ListTutorScheduledClassesInput } from './list-tutor-scheduled-classes.input';
import { ListTutorScheduledClassesOutput } from './list-tutor-scheduled-classes.output';

/**
 * Use case for listing all classes scheduled by a tutor
 */
@injectable()
export class ListTutorScheduledClassesUseCase {
  constructor(
    @inject(ScheduledClassSymbols.repositories.ScheduledClassRepository)
    private readonly scheduledClassRepository: ScheduledClassRepository
  ) {}

  async execute(input: ListTutorScheduledClassesInput): Promise<ListTutorScheduledClassesOutput> {
    const scheduledClasses = await this.scheduledClassRepository.findByTutorId(input.tutorId);

    return { scheduledClasses };
  }
}
