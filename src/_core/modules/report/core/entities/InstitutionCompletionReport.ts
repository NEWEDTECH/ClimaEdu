/**
 * InstitutionCompletionReport
 * 
 * Persona: Admin
 * Purpose: Show overall course completion rate across the institution.
 * Fields:
 * - institutionId: The institution being reported on
 * - averageCompletionRate: The average completion rate across all enrollments (0-100)
 * - numberOfCompletedEnrollments: Number of enrollments that have been completed
 * - numberOfActiveEnrollments: Number of enrollments that are still active (not completed)
 */
export class InstitutionCompletionReport {
  private constructor(
    readonly institutionId: string,
    readonly averageCompletionRate: number,
    readonly numberOfCompletedEnrollments: number,
    readonly numberOfActiveEnrollments: number
  ) {}

  /**
   * Creates a new InstitutionCompletionReport instance
   * @param params Report properties
   * @returns A new InstitutionCompletionReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    institutionId: string;
    numberOfCompletedEnrollments: number;
    numberOfActiveEnrollments: number;
    averageCompletionRate?: number;
  }): InstitutionCompletionReport {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.numberOfCompletedEnrollments < 0) {
      throw new Error('Number of completed enrollments cannot be negative');
    }

    if (params.numberOfActiveEnrollments < 0) {
      throw new Error('Number of active enrollments cannot be negative');
    }

    // Calculate average completion rate if not provided
    const totalEnrollments = params.numberOfCompletedEnrollments + params.numberOfActiveEnrollments;
    const averageCompletionRate = params.averageCompletionRate !== undefined
      ? params.averageCompletionRate
      : totalEnrollments === 0
        ? 0
        : Math.round((params.numberOfCompletedEnrollments / totalEnrollments) * 100);

    // Validate average completion rate
    if (averageCompletionRate < 0 || averageCompletionRate > 100) {
      throw new Error('Average completion rate must be between 0 and 100');
    }

    return new InstitutionCompletionReport(
      params.institutionId,
      averageCompletionRate,
      params.numberOfCompletedEnrollments,
      params.numberOfActiveEnrollments
    );
  }

  /**
   * Gets the total number of enrollments (completed + active)
   * @returns The total number of enrollments
   */
  public getTotalEnrollments(): number {
    return this.numberOfCompletedEnrollments + this.numberOfActiveEnrollments;
  }

  /**
   * Calculates the completion rate as a percentage
   * @returns The percentage of enrollments that are completed (0-100)
   */
  public getCompletionRate(): number {
    const totalEnrollments = this.getTotalEnrollments();
    if (totalEnrollments === 0) {
      return 0;
    }
    return Math.round((this.numberOfCompletedEnrollments / totalEnrollments) * 100);
  }
}
