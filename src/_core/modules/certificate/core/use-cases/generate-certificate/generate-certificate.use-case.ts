import { injectable, inject } from 'inversify';
import type { CertificateRepository } from '../../../infrastructure/repositories/CertificateRepository';
import type { GenerateCertificateInput } from './generate-certificate.input';
import type { GenerateCertificateOutput } from './generate-certificate.output';
import { Certificate } from '../../entities/Certificate';
import { Register } from '@/_core/shared/container';
import type { EventBus } from '@/_core/shared/events/interfaces/EventBus';
import { CertificateEarnedEvent } from '@/_core/modules/achievement/core/events';

/**
 * Use case for generating a certificate for a completed course
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class GenerateCertificateUseCase {
  constructor(
    @inject(Register.certificate.repository.CertificateRepository)
    private certificateRepository: CertificateRepository,
    
    @inject(Register.shared.service.EventBus)
    private eventBus: EventBus
  ) {}

  /**
   * Executes the generate certificate use case
   * @param input GenerateCertificateInput
   * @returns GenerateCertificateOutput
   * @throws Error if validation fails
   */
  async execute(input: GenerateCertificateInput): Promise<GenerateCertificateOutput> {
    // Validate input
    this.validateInput(input);

    // Check if certificate already exists for this user and course
    const existingCertificate = await this.certificateRepository.findByUserAndCourse(
      input.userId,
      input.courseId
    );

    if (existingCertificate) {
      return {
        certificate: existingCertificate,
        isNew: false
      };
    }

    // Generate certificate PDF URL by calling the API
    const certificateUrl = await this.generateCertificatePDF(input);

    // Generate new certificate ID
    const certificateId = await this.certificateRepository.generateId();

    // Create certificate entity
    const certificate = Certificate.create({
      id: certificateId,
      userId: input.userId,
      courseId: input.courseId,
      institutionId: input.institutionId,
      certificateUrl,
      issuedAt: new Date()
    });

    // Save certificate
    const savedCertificate = await this.certificateRepository.save(certificate);

    // Publish CertificateEarnedEvent for new certificates
    try {
      const certificateEarnedEvent = CertificateEarnedEvent.create({
        userId: savedCertificate.userId,
        institutionId: savedCertificate.institutionId,
        certificateId: savedCertificate.id,
        courseId: savedCertificate.courseId,
        courseName: input.courseName,
        certificateType: 'COMPLETION',
        issuedDate: savedCertificate.issuedAt,
        score: input.grade
      });
      
      await this.eventBus.publish(certificateEarnedEvent);
      console.log('🎯 CertificateEarnedEvent published for new certificate:', savedCertificate.id);
    } catch (error) {
      console.error('Failed to publish CertificateEarnedEvent:', error);
      // Don't fail the use case if event publishing fails
    }

    return {
      certificate: savedCertificate,
      isNew: true
    };
  }

  /**
   * Generates certificate PDF by calling the API route
   * @param input Certificate input data
   * @returns URL of the generated certificate PDF
   */
  private async generateCertificatePDF(input: GenerateCertificateInput): Promise<string> {
    const response = await fetch('/api/certificates/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: input.userId,
        courseId: input.courseId,
        institutionId: input.institutionId,
        courseName: input.courseName,
        studentName: input.studentName,
        instructorName: input.instructorName,
        hoursCompleted: input.hoursCompleted,
        grade: input.grade,
        completionDate: input.completionDate?.toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate certificate PDF: ${response.statusText}`);
    }

    const result = await response.json();
    return result.certificateUrl;
  }

  /**
   * Validates the input parameters
   * @param input GenerateCertificateInput
   * @throws Error if validation fails
   */
  private validateInput(input: GenerateCertificateInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!input.courseId || input.courseId.trim() === '') {
      throw new Error('Course ID is required');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }

    if (!input.courseName || input.courseName.trim() === '') {
      throw new Error('Course name is required');
    }

    if (input.hoursCompleted !== undefined && input.hoursCompleted < 0) {
      throw new Error('Hours completed cannot be negative');
    }

    if (input.grade !== undefined && (input.grade < 0 || input.grade > 100)) {
      throw new Error('Grade must be between 0 and 100');
    }
  }
}