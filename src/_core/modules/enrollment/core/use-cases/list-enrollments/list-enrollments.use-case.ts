import { injectable, inject } from 'inversify';
import type { EnrollmentRepository } from '../../../infrastructure/repositories/EnrollmentRepository';
import { Register } from '@/_core/shared/container';
import { ListEnrollmentsInput } from './list-enrollments.input';
import { ListEnrollmentsOutput } from './list-enrollments.output';
import { Enrollment } from '../../entities/Enrollment';

/**
 * Use case for listing enrollments with optional filters
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class ListEnrollmentsUseCase {
  constructor(
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private enrollmentRepository: EnrollmentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data with optional filters
   * @returns Output data with the list of enrollments
   */
  async execute(input: ListEnrollmentsInput): Promise<ListEnrollmentsOutput> {
    let enrollments: Enrollment[] = [];

    // If userId is provided, filter by user
    if (input.userId) {
      enrollments = await this.enrollmentRepository.listByUser(input.userId);
    }
    // If courseId is provided, filter by course
    else if (input.courseId) {
      enrollments = await this.enrollmentRepository.listByCourse(input.courseId);
    }
    // If neither userId nor courseId is provided, we need to implement a method to list all enrollments
    // This is not currently supported by the repository interface
    else {
      throw new Error('At least one filter (userId or courseId) must be provided');
    }

    // If status is provided, filter the results by status
    if (input.status) {
      enrollments = enrollments.filter(enrollment => enrollment.status === input.status);
    }

    return {
      enrollments
    };
  }
}
