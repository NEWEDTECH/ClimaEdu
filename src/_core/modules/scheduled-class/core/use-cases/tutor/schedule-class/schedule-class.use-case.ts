import { inject, injectable } from 'inversify';
import { ScheduledClass } from '../../../entities/ScheduledClass';
import { ScheduledClassSymbols } from '@/_core/shared/container/modules/scheduled-class/symbols';
import { ContentSymbols } from '@/_core/shared/container/modules/content/symbols';
import { EnrollmentSymbols } from '@/_core/shared/container/modules/enrollment/symbols';
import type { ScheduledClassRepository } from '../../../../infrastructure/repositories/ScheduledClassRepository';
import type { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository';
import type { ClassRepository } from '@/_core/modules/enrollment/infrastructure/repositories/ClassRepository';
import { ScheduleClassInput } from './schedule-class.input';
import { ScheduleClassOutput } from './schedule-class.output';

/**
 * Use case for a tutor to schedule a live class for a whole class (turma)
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for creating and scheduling a new class
 */
@injectable()
export class ScheduleClassUseCase {
  constructor(
    @inject(ScheduledClassSymbols.repositories.ScheduledClassRepository)
    private readonly scheduledClassRepository: ScheduledClassRepository,
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository,
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  async execute(input: ScheduleClassInput): Promise<ScheduleClassOutput> {
    const klass = await this.classRepository.findById(input.classId);

    if (!klass) {
      throw new Error('Turma não encontrada');
    }

    if (!klass.courseId) {
      throw new Error('A turma selecionada não está vinculada a um curso');
    }

    await this.validateTutorTeachesCourse(input.tutorId, klass.courseId);

    const id = await this.scheduledClassRepository.generateId();

    const scheduledClass = ScheduledClass.create({
      id,
      tutorId: input.tutorId,
      classId: klass.id,
      courseId: klass.courseId,
      institutionId: klass.institutionId,
      scheduledDate: input.scheduledDate,
      meetingUrl: input.meetingUrl,
      title: input.title
    });

    const saved = await this.scheduledClassRepository.save(scheduledClass);

    return {
      scheduledClass: saved,
      success: true,
      message: 'Aula agendada com sucesso'
    };
  }

  /**
   * Ensures the tutor is associated with the course of the selected class
   */
  private async validateTutorTeachesCourse(tutorId: string, courseId: string): Promise<void> {
    const courseTutors = await this.courseTutorRepository.findByCourseId(courseId);
    const isTutorOfCourse = courseTutors.some(courseTutor => courseTutor.userId === tutorId);

    if (!isTutorOfCourse) {
      throw new Error('Você não é tutor do curso desta turma');
    }
  }
}
