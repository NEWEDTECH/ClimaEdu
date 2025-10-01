import { injectable, inject } from 'inversify';
import type { CertificateRepository } from '../../../infrastructure/repositories/CertificateRepository';
import type { GetCertificateByIdInput } from './get-certificate-by-id.input';
import type { GetCertificateByIdOutput } from './get-certificate-by-id.output';
import { Register } from '@/_core/shared/container';

/**
 * Use case for getting a certificate by its ID
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class GetCertificateByIdUseCase {
  constructor(
    @inject(Register.certificate.repository.CertificateRepository)
    private certificateRepository: CertificateRepository
  ) {}

  /**
   * Executes the get certificate by ID use case
   * @param input GetCertificateByIdInput
   * @returns GetCertificateByIdOutput
   * @throws Error if validation fails
   */
  async execute(input: GetCertificateByIdInput): Promise<GetCertificateByIdOutput> {
    // Validate input
    this.validateInput(input);

    // Get certificate by ID
    const certificate = await this.certificateRepository.findById(input.certificateId);

    return {
      certificate
    };
  }

  /**
   * Validates the input parameters
   * @param input GetCertificateByIdInput
   * @throws Error if validation fails
   */
  private validateInput(input: GetCertificateByIdInput): void {
    if (!input.certificateId || input.certificateId.trim() === '') {
      throw new Error('Certificate ID is required');
    }
  }
}