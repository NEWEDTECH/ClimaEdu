/**
 * InstitutionCertificateReport
 * 
 * Persona: Admin
 * Purpose: Track certificates issued per course and student.
 * Fields:
 * - institutionId: The institution being reported on
 * - courseId: The specific course being analyzed
 * - certificatesIssued: Total number of certificates issued for this course
 * - studentsCertified: Number of unique students who received certificates
 */
export class InstitutionCertificateReport {
  private constructor(
    readonly institutionId: string,
    readonly courseId: string,
    readonly certificatesIssued: number,
    readonly studentsCertified: number
  ) {}

  /**
   * Creates a new InstitutionCertificateReport instance
   * @param params Report properties
   * @returns A new InstitutionCertificateReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    institutionId: string;
    courseId: string;
    certificatesIssued: number;
    studentsCertified: number;
  }): InstitutionCertificateReport {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    if (params.certificatesIssued < 0) {
      throw new Error('Number of certificates issued cannot be negative');
    }

    if (params.studentsCertified < 0) {
      throw new Error('Number of students certified cannot be negative');
    }

    if (params.studentsCertified > params.certificatesIssued) {
      throw new Error('Number of students certified cannot exceed number of certificates issued');
    }

    return new InstitutionCertificateReport(
      params.institutionId,
      params.courseId,
      params.certificatesIssued,
      params.studentsCertified
    );
  }

  /**
   * Calculates the average number of certificates per certified student
   * @returns The average number of certificates per student
   */
  public getAverageCertificatesPerStudent(): number {
    if (this.studentsCertified === 0) {
      return 0;
    }
    return parseFloat((this.certificatesIssued / this.studentsCertified).toFixed(2));
  }

  /**
   * Determines if there are multiple certificates per student on average
   * @returns True if there are multiple certificates per student on average
   */
  public hasMultipleCertificatesPerStudent(): boolean {
    return this.getAverageCertificatesPerStudent() > 1;
  }
}
