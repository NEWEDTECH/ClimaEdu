import { inject, injectable } from 'inversify';
import type { ListClassStudentsInput } from './list-class-students.input';
import type { ListClassStudentsOutput } from './list-class-students.output';
import type { ClassRepository } from '../../../infrastructure/repositories/ClassRepository';
import type { EnrollmentRepository } from '../../../infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import { Register } from '../../../../../shared/container/symbols';
import { User } from '../../../../user/core/entities/User';

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

    // Resolve each ID to a userId.
    // Legacy fallback: some classes stored the student's userId directly in
    // enrollmentIds instead of the enrollment ID, so if no enrollment is found
    // we treat the ID as a userId.
    const userIds = await Promise.all(
      classData.enrollmentIds.map(async (enrollmentId: string) => {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        return enrollment ? enrollment.userId : enrollmentId;
      })
    );

    const uniqueUserIds = Array.from(new Set(userIds));

    const students = await Promise.all(
      uniqueUserIds.map((userId: string) => this.userRepository.findById(userId))
    );

    const filteredStudents = students.filter((student: User | null): student is User => student !== null);

    return { students: filteredStudents };
  }
}
