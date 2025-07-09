/**
 * Certificate entity representing a formal document issued when a user completes a course
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Certificate {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly courseId: string,
    readonly institutionId: string,
    readonly issuedAt: Date,
    readonly certificateNumber: string,
    public certificateUrl: string
  ) {}

  /**
   * Creates a new Certificate instance
   * @param params Certificate properties
   * @returns A new Certificate instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    userId: string;
    courseId: string;
    institutionId: string;
    issuedAt?: Date;
    certificateNumber?: string;
    certificateUrl: string;
  }): Certificate {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (!params.certificateUrl || params.certificateUrl.trim() === '') {
      throw new Error('Certificate URL cannot be empty');
    }

    // Generate certificate number if not provided
    const certificateNumber = params.certificateNumber || Certificate.generateCertificateNumber();
    
    // Default issuedAt to now if not provided
    const issuedAt = params.issuedAt || new Date();

    return new Certificate(
      params.id,
      params.userId,
      params.courseId,
      params.institutionId,
      issuedAt,
      certificateNumber,
      params.certificateUrl
    );
  }

  /**
   * Generates a globally unique certificate number
   * @returns A unique certificate number
   */
  public static generateCertificateNumber(): string {
    // Generate a unique certificate number using timestamp and UUID
    const timestamp = new Date().getTime().toString(36).toUpperCase();
    const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `CERT-${timestamp}-${uuid}`;
  }

  /**
   * Updates the certificate URL
   * @param newUrl The new certificate URL
   * @throws Error if the new URL is empty
   */
  public updateCertificateUrl(newUrl: string): void {
    if (!newUrl || newUrl.trim() === '') {
      throw new Error('Certificate URL cannot be empty');
    }
    this.certificateUrl = newUrl;
  }

  /**
   * Validates if the certificate is authentic by checking its number
   * @returns True if the certificate is authentic
   */
  public isAuthentic(): boolean {
    // In a real implementation, this would check against a database or other verification mechanism
    // For now, we'll just return true if the certificate number follows our format
    const certificateNumberRegex = /^CERT-[0-9A-Z]+-[0-9A-Z]+$/;
    return certificateNumberRegex.test(this.certificateNumber);
  }
}
