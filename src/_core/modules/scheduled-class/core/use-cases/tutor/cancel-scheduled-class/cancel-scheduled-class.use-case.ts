import { inject, injectable } from 'inversify';
import { ScheduledClassSymbols } from '@/_core/shared/container/modules/scheduled-class/symbols';
import type { ScheduledClassRepository } from '../../../../infrastructure/repositories/ScheduledClassRepository';
import { CancelScheduledClassInput } from './cancel-scheduled-class.input';
import { CancelScheduledClassOutput } from './cancel-scheduled-class.output';

/**
 * Use case for a tutor to cancel a scheduled class
 */
@injectable()
export class CancelScheduledClassUseCase {
  constructor(
    @inject(ScheduledClassSymbols.repositories.ScheduledClassRepository)
    private readonly scheduledClassRepository: ScheduledClassRepository
  ) {}

  async execute(input: CancelScheduledClassInput): Promise<CancelScheduledClassOutput> {
    const scheduledClass = await this.scheduledClassRepository.findById(input.scheduledClassId);

    if (!scheduledClass) {
      throw new Error('Aula não encontrada');
    }

    if (scheduledClass.tutorId !== input.tutorId) {
      throw new Error('Você não tem permissão para cancelar esta aula');
    }

    // Business rules (already cancelled/occurred) are enforced by the entity
    scheduledClass.cancel(input.reason);

    const saved = await this.scheduledClassRepository.save(scheduledClass);

    return {
      scheduledClass: saved,
      success: true,
      message: 'Aula cancelada com sucesso'
    };
  }
}
