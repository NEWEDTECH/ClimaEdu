/**
 * InstitutionCourseReport
 * 
 * Persona: Admin
 * Purpose: List courses and general usage statistics.
 * Fields:
 * - institutionId: The institution being reported on
 * - totalCourses: Total number of courses in the institution
 * - activeCourses: Number of courses currently active (not archived)
 * - archivedCourses: Number of courses that have been archived
 * - totalEnrollments: Total number of enrollments across all courses
 */
export class InstitutionCourseReport {
  private constructor(
    readonly institutionId: string,
    readonly totalCourses: number,
    readonly activeCourses: number,
    readonly archivedCourses: number,
    readonly totalEnrollments: number
  ) {}

  /**
   * Creates a new InstitutionCourseReport instance
   * @param params Report properties
   * @returns A new InstitutionCourseReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    institutionId: string;
    activeCourses: number;
    archivedCourses: number;
    totalEnrollments: number;
    totalCourses?: number;
  }): InstitutionCourseReport {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.activeCourses < 0) {
      throw new Error('Number of active courses cannot be negative');
    }

    if (params.archivedCourses < 0) {
      throw new Error('Number of archived courses cannot be negative');
    }

    if (params.totalEnrollments < 0) {
      throw new Error('Total enrollments cannot be negative');
    }

    // Calculate total courses if not provided
    const totalCourses = params.totalCourses !== undefined
      ? params.totalCourses
      : params.activeCourses + params.archivedCourses;

    // Validate total courses
    if (totalCourses < 0) {
      throw new Error('Total courses cannot be negative');
    }

    if (totalCourses < params.activeCourses + params.archivedCourses) {
      throw new Error('Total courses cannot be less than the sum of active and archived courses');
    }

    return new InstitutionCourseReport(
      params.institutionId,
      totalCourses,
      params.activeCourses,
      params.archivedCourses,
      params.totalEnrollments
    );
  }

  /**
   * Calculates the average number of enrollments per course
   * @returns The average number of enrollments per course
   */
  public getAverageEnrollmentsPerCourse(): number {
    if (this.totalCourses === 0) {
      return 0;
    }
    return Math.round(this.totalEnrollments / this.totalCourses);
  }

  /**
   * Calculates the percentage of courses that are active
   * @returns The percentage of courses that are active (0-100)
   */
  public getActiveCoursesPercentage(): number {
    if (this.totalCourses === 0) {
      return 0;
    }
    return Math.round((this.activeCourses / this.totalCourses) * 100);
  }

  /**
   * Calculates the percentage of courses that are archived
   * @returns The percentage of courses that are archived (0-100)
   */
  public getArchivedCoursesPercentage(): number {
    if (this.totalCourses === 0) {
      return 0;
    }
    return Math.round((this.archivedCourses / this.totalCourses) * 100);
  }
}
