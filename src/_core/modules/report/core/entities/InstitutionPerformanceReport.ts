/**
 * InstitutionPerformanceReport
 * 
 * Persona: Institution (Global)
 * Purpose: Measure average performance metrics across all students.
 * Fields:
 * - institutionId: The institution being reported on
 * - averageScore: The average assessment score across all students (0-100)
 * - totalStudents: Total number of students in the institution
 * - activeStudents: Number of students who have been active recently
 * - certifiedStudents: Number of students who have received at least one certificate
 */
export class InstitutionPerformanceReport {
  private constructor(
    readonly institutionId: string,
    readonly averageScore: number,
    readonly totalStudents: number,
    readonly activeStudents: number,
    readonly certifiedStudents: number
  ) {}

  /**
   * Creates a new InstitutionPerformanceReport instance
   * @param params Report properties
   * @returns A new InstitutionPerformanceReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    institutionId: string;
    averageScore: number;
    totalStudents: number;
    activeStudents: number;
    certifiedStudents: number;
  }): InstitutionPerformanceReport {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.averageScore < 0 || params.averageScore > 100) {
      throw new Error('Average score must be between 0 and 100');
    }

    if (params.totalStudents < 0) {
      throw new Error('Total students cannot be negative');
    }

    if (params.activeStudents < 0) {
      throw new Error('Active students cannot be negative');
    }

    if (params.certifiedStudents < 0) {
      throw new Error('Certified students cannot be negative');
    }

    if (params.activeStudents > params.totalStudents) {
      throw new Error('Active students cannot exceed total students');
    }

    if (params.certifiedStudents > params.totalStudents) {
      throw new Error('Certified students cannot exceed total students');
    }

    return new InstitutionPerformanceReport(
      params.institutionId,
      params.averageScore,
      params.totalStudents,
      params.activeStudents,
      params.certifiedStudents
    );
  }

  /**
   * Calculates the percentage of students that are active
   * @returns The percentage of students that are active (0-100)
   */
  public getActiveStudentsPercentage(): number {
    if (this.totalStudents === 0) {
      return 0;
    }
    return Math.round((this.activeStudents / this.totalStudents) * 100);
  }

  /**
   * Calculates the percentage of students that are certified
   * @returns The percentage of students that are certified (0-100)
   */
  public getCertifiedStudentsPercentage(): number {
    if (this.totalStudents === 0) {
      return 0;
    }
    return Math.round((this.certifiedStudents / this.totalStudents) * 100);
  }

  /**
   * Calculates the percentage of active students that are certified
   * @returns The percentage of active students that are certified (0-100)
   */
  public getCertifiedActiveStudentsPercentage(): number {
    if (this.activeStudents === 0) {
      return 0;
    }
    // Assuming certified students are a subset of active students
    const certifiedActiveStudents = Math.min(this.certifiedStudents, this.activeStudents);
    return Math.round((certifiedActiveStudents / this.activeStudents) * 100);
  }
}
