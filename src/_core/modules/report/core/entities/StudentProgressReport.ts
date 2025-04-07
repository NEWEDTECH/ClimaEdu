/**
 * StudentProgressReport
 * 
 * Persona: Tutor
 * Purpose: View a student's overall course progress managed by a tutor.
 * Fields:
 * - tutorId: Identifies the tutor viewing the report
 * - studentId: Identifies the specific student being monitored
 * - courseId: Identifies the specific course being tracked
 * - institutionId: The institution context for this report
 * - progressPercentage: Overall percentage of course completion (0-100)
 * - lastActivityDate: When the student last interacted with the course
 */
export class StudentProgressReport {
  private constructor(
    readonly tutorId: string,
    readonly studentId: string,
    readonly courseId: string,
    readonly institutionId: string,
    readonly progressPercentage: number,
    readonly lastActivityDate: Date
  ) {}

  /**
   * Creates a new StudentProgressReport instance
   * @param params Report properties
   * @returns A new StudentProgressReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    tutorId: string;
    studentId: string;
    courseId: string;
    institutionId: string;
    progressPercentage: number;
    lastActivityDate: Date;
  }): StudentProgressReport {
    if (!params.tutorId || params.tutorId.trim() === '') {
      throw new Error('Tutor ID cannot be empty');
    }

    if (!params.studentId || params.studentId.trim() === '') {
      throw new Error('Student ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.progressPercentage < 0 || params.progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    if (!(params.lastActivityDate instanceof Date)) {
      throw new Error('Last activity date must be a valid Date object');
    }

    return new StudentProgressReport(
      params.tutorId,
      params.studentId,
      params.courseId,
      params.institutionId,
      params.progressPercentage,
      params.lastActivityDate
    );
  }
}
