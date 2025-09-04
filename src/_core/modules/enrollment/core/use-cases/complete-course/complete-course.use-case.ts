import { injectable, inject } from 'inversify';
import type { EnrollmentRepository } from '../../../infrastructure/repositories/EnrollmentRepository';
import { GenerateCertificateUseCase } from '@/_core/modules/certificate';
import type { CompleteCourseInput } from './complete-course.input';
import type { CompleteCourseOutput } from './complete-course.output';
import { EnrollmentStatus } from '../../entities/EnrollmentStatus';
import { Register } from '@/_core/shared/container';

/**
 * Use case for completing a course
 * Marks enrollment as completed and generates a certificate automatically
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class CompleteCourseUseCase {
  constructor(
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private enrollmentRepository: EnrollmentRepository,
    @inject(Register.certificate.useCase.GenerateCertificateUseCase)
    private generateCertificateUseCase: GenerateCertificateUseCase
  ) {}

  /**
   * Executes the complete course use case
   * @param input CompleteCourseInput
   * @returns CompleteCourseOutput
   * @throws Error if validation fails or enrollment not found
   */
  async execute(input: CompleteCourseInput): Promise<CompleteCourseOutput> {
    // Validate input
    this.validateInput(input);

    // Find existing enrollment
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      input.userId,
      input.courseId
    );

    if (!enrollment) {
      throw new Error(
        `Enrollment not found for user ${input.userId} and course ${input.courseId}. ` +
        'User must be enrolled in the course before it can be completed.'
      );
    }

    // Check if already completed
    const wasAlreadyCompleted = enrollment.status === EnrollmentStatus.COMPLETED;

    // Complete the enrollment if not already completed
    if (!wasAlreadyCompleted) {
      enrollment.complete();
      await this.enrollmentRepository.save(enrollment);
    }

    // Generate certificate (will return existing one if already exists)
    const certificateResult = await this.generateCertificateUseCase.execute({
      userId: input.userId,
      courseId: input.courseId,
      institutionId: input.institutionId,
      courseName: input.courseName || `Course ${input.courseId}`,
      instructorName: input.instructorName,
      hoursCompleted: input.hoursCompleted,
      grade: input.grade,
      completionDate: enrollment.completedAt || new Date()
    });

    return {
      enrollment,
      certificate: certificateResult.certificate,
      wasAlreadyCompleted
    };
  }

  /**
   * Validates the input parameters
   * @param input CompleteCourseInput
   * @throws Error if validation fails
   */
  private validateInput(input: CompleteCourseInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.courseId || input.courseId.trim() === '') {
      throw new Error('Course ID is required');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }

    if (input.hoursCompleted !== undefined && input.hoursCompleted < 0) {
      throw new Error('Hours completed cannot be negative');
    }

    if (input.grade !== undefined && (input.grade < 0 || input.grade > 100)) {
      throw new Error('Grade must be between 0 and 100');
    }
  }
}