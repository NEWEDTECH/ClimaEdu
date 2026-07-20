import { inject, injectable } from 'inversify';
import { ScheduledClassSymbols } from '@/_core/shared/container/modules/scheduled-class/symbols';
import { EnrollmentSymbols } from '@/_core/shared/container/modules/enrollment/symbols';
import type { ScheduledClassRepository } from '../../../../infrastructure/repositories/ScheduledClassRepository';
import type { ClassRepository } from '@/_core/modules/enrollment/infrastructure/repositories/ClassRepository';
import type { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository';
import { ListStudentScheduledClassesInput } from './list-student-scheduled-classes.input';
import { ListStudentScheduledClassesOutput, StudentScheduledClassItem } from './list-student-scheduled-classes.output';

/**
 * Use case for listing the classes scheduled for the classes (turmas) a student belongs to
 */
@injectable()
export class ListStudentScheduledClassesUseCase {
  constructor(
    @inject(ScheduledClassSymbols.repositories.ScheduledClassRepository)
    private readonly scheduledClassRepository: ScheduledClassRepository,
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository,
    @inject(EnrollmentSymbols.repositories.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository
  ) {}

  async execute(input: ListStudentScheduledClassesInput): Promise<ListStudentScheduledClassesOutput> {
    const enrollments = await this.enrollmentRepository.listByUser(input.studentId);

    if (enrollments.length === 0) {
      return { items: [] };
    }

    const studentEnrollmentIds = new Set(enrollments.map(enrollment => enrollment.id));

    const institutionClasses = await this.classRepository.findAll(input.institutionId);
    const studentClasses = institutionClasses.filter(klass =>
      klass.enrollmentIds.some(enrollmentId => studentEnrollmentIds.has(enrollmentId))
    );

    if (studentClasses.length === 0) {
      return { items: [] };
    }

    const classNameById = new Map(studentClasses.map(klass => [klass.id, klass.name]));

    const scheduledClasses = await this.scheduledClassRepository.findByClassIds(
      studentClasses.map(klass => klass.id)
    );

    const items: StudentScheduledClassItem[] = scheduledClasses.map(scheduledClass => ({
      scheduledClass,
      className: classNameById.get(scheduledClass.classId) ?? 'Turma'
    }));

    return { items };
  }
}
