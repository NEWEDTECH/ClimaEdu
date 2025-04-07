/**
 * InstitutionUserReport
 * 
 * Persona: Admin
 * Purpose: Summarize the number of users by role in the institution.
 * Fields:
 * - institutionId: The institution being reported on
 * - totalUsers: Total number of users across all roles
 * - numberOfStudents: Number of users with the STUDENT role
 * - numberOfTutors: Number of users with the TUTOR role
 * - numberOfAdmins: Number of users with the ADMINISTRATOR role
 */
export class InstitutionUserReport {
  private constructor(
    readonly institutionId: string,
    readonly totalUsers: number,
    readonly numberOfStudents: number,
    readonly numberOfTutors: number,
    readonly numberOfAdmins: number
  ) {}

  /**
   * Creates a new InstitutionUserReport instance
   * @param params Report properties
   * @returns A new InstitutionUserReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    institutionId: string;
    numberOfStudents: number;
    numberOfTutors: number;
    numberOfAdmins: number;
    totalUsers?: number;
  }): InstitutionUserReport {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.numberOfStudents < 0) {
      throw new Error('Number of students cannot be negative');
    }

    if (params.numberOfTutors < 0) {
      throw new Error('Number of tutors cannot be negative');
    }

    if (params.numberOfAdmins < 0) {
      throw new Error('Number of admins cannot be negative');
    }

    // Calculate total users if not provided
    const totalUsers = params.totalUsers !== undefined
      ? params.totalUsers
      : params.numberOfStudents + params.numberOfTutors + params.numberOfAdmins;

    // Validate total users
    if (totalUsers < 0) {
      throw new Error('Total users cannot be negative');
    }

    if (totalUsers < params.numberOfStudents + params.numberOfTutors + params.numberOfAdmins) {
      throw new Error('Total users cannot be less than the sum of users by role');
    }

    return new InstitutionUserReport(
      params.institutionId,
      totalUsers,
      params.numberOfStudents,
      params.numberOfTutors,
      params.numberOfAdmins
    );
  }

  /**
   * Calculates the percentage of users that are students
   * @returns The percentage of users that are students (0-100)
   */
  public getStudentPercentage(): number {
    if (this.totalUsers === 0) {
      return 0;
    }
    return Math.round((this.numberOfStudents / this.totalUsers) * 100);
  }

  /**
   * Calculates the percentage of users that are tutors
   * @returns The percentage of users that are tutors (0-100)
   */
  public getTutorPercentage(): number {
    if (this.totalUsers === 0) {
      return 0;
    }
    return Math.round((this.numberOfTutors / this.totalUsers) * 100);
  }

  /**
   * Calculates the percentage of users that are admins
   * @returns The percentage of users that are admins (0-100)
   */
  public getAdminPercentage(): number {
    if (this.totalUsers === 0) {
      return 0;
    }
    return Math.round((this.numberOfAdmins / this.totalUsers) * 100);
  }
}
