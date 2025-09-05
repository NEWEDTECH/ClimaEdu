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
  async execute({userId, courseId, institutionId, status}: ListEnrollmentsInput): Promise<ListEnrollmentsOutput> {
    let enrollments: Enrollment[] = [];

    // If userId is provided, filter by user
    if (userId) {
      enrollments = await this.enrollmentRepository.listByUser(userId);
    }
    // If courseId is provided, filter by course
    else if (courseId) {
      enrollments = await this.enrollmentRepository.listByCourse(courseId);
    }
    // If institutionId is provided, filter by institution
    else if (institutionId) {
      enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    }
    // If no filter is provided, throw an error
    else {
      throw new Error('At least one filter (userId, courseId, or institutionId) must be provided');
    }


    // If status is provided, filter the results by status
    if (status) {
      enrollments = enrollments.filter(enrollment => status.includes(enrollment.status));
    }


    return {
      enrollments
    };
  }
}
