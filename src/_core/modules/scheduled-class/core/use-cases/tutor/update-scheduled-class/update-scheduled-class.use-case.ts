import { inject, injectable } from 'inversify';
import { ScheduledClassSymbols } from '@/_core/shared/container/modules/scheduled-class/symbols';
import type { ScheduledClassRepository } from '../../../../infrastructure/repositories/ScheduledClassRepository';
import { UpdateScheduledClassInput } from './update-scheduled-class.input';
import { UpdateScheduledClassOutput } from './update-scheduled-class.output';

/**
 * Use case for a tutor to update a scheduled class (date, meeting URL and title)
 */
@injectable()
export class UpdateScheduledClassUseCase {
  constructor(
    @inject(ScheduledClassSymbols.repositories.ScheduledClassRepository)
    private readonly scheduledClassRepository: ScheduledClassRepository
  ) {}

  async execute(input: UpdateScheduledClassInput): Promise<UpdateScheduledClassOutput> {
    const scheduledClass = await this.scheduledClassRepository.findById(input.scheduledClassId);

    if (!scheduledClass) {
      throw new Error('Aula não encontrada');
    }

    if (scheduledClass.tutorId !== input.tutorId) {
      throw new Error('Você não tem permissão para editar esta aula');
    }

    // Business rules (cancelled/occurred/date/url) are enforced by the entity
    scheduledClass.updateDetails({
      scheduledDate: input.scheduledDate,
      meetingUrl: input.meetingUrl,
      title: input.title
    });

    const saved = await this.scheduledClassRepository.save(scheduledClass);

    return {
      scheduledClass: saved,
      success: true,
      message: 'Aula atualizada com sucesso'
    };
  }
}
