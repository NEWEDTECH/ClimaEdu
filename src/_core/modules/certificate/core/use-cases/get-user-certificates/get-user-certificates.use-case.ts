import { injectable, inject } from 'inversify';
import type { CertificateRepository } from '../../../infrastructure/repositories/CertificateRepository';
import type { GetUserCertificatesInput } from './get-user-certificates.input';
import type { GetUserCertificatesOutput } from './get-user-certificates.output';
import { Register } from '@/_core/shared/container';

/**
 * Use case for getting all certificates of a user
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class GetUserCertificatesUseCase {
  constructor(
    @inject(Register.certificate.repository.CertificateRepository) private certificateRepository: CertificateRepository
  ) {}

  /**
   * Executes the get user certificates use case
   * @param input GetUserCertificatesInput
   * @returns GetUserCertificatesOutput
   * @throws Error if validation fails
   */
  async execute(input: GetUserCertificatesInput): Promise<GetUserCertificatesOutput> {
    // Validate input
    this.validateInput(input);

    // Get certificates for the user
    const certificates = await this.certificateRepository.listByUser(input.userId);

    return {
      certificates
    };
  }

  /**
   * Validates the input parameters
   * @param input GetUserCertificatesInput
   * @throws Error if validation fails
   */
  private validateInput(input: GetUserCertificatesInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }
  }
}