import { injectable, inject } from 'inversify';
import type { EnrollmentRepository } from '../../../infrastructure/repositories/EnrollmentRepository';
import { Register } from '@/_core/shared/container';
import { CancelEnrollmentInput } from './cancel-enrollment.input';
import { CancelEnrollmentOutput } from './cancel-enrollment.output';

/**
 * Use case for canceling an enrollment
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CancelEnrollmentUseCase {
  constructor(
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private enrollmentRepository: EnrollmentRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if enrollment not found or already cancelled
   */
  async execute(input: CancelEnrollmentInput): Promise<CancelEnrollmentOutput> {
    // Verify that the enrollment exists
    const enrollment = await this.enrollmentRepository.findById(input.enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment with ID ${input.enrollmentId} not found`);
    }

    // Cancel the enrollment using the entity's method
    enrollment.cancel();

    // Save the updated enrollment
    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    return {
      enrollment: savedEnrollment
    };
  }
}
