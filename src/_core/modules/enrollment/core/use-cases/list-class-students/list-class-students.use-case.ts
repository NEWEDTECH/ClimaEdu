import { inject, injectable } from 'inversify';
import type { ListClassStudentsInput } from './list-class-students.input';
import type { ListClassStudentsOutput } from './list-class-students.output';
import type { ClassRepository } from '../../../infrastructure/repositories/ClassRepository';
import type { EnrollmentRepository } from '../../../infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import { Register } from '../../../../../shared/container/symbols';
import { User } from '../../../../user/core/entities/User';
import { Enrollment } from '../../entities/Enrollment';

@injectable()
export class ListClassStudentsUseCase {
  constructor(
    @inject(Register.enrollment.repository.ClassRepository)
    private readonly classRepository: ClassRepository,
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: ListClassStudentsInput): Promise<ListClassStudentsOutput> {
    const classData = await this.classRepository.findById(input.classId);

    if (!classData) {
      return { students: [] };
    }

    const enrollments = await Promise.all(
      classData.enrollmentIds.map((enrollmentId: string) => this.enrollmentRepository.findById(enrollmentId))
    );

    const filteredEnrollments = enrollments.filter((enrollment: Enrollment | null): enrollment is Enrollment => enrollment !== null);

    const students = await Promise.all(
      filteredEnrollments.map((enrollment: Enrollment) => this.userRepository.findById(enrollment.userId))
    );

    const filteredStudents = students.filter((student: User | null): student is User => student !== null);

    return { students: filteredStudents };
  }
}
