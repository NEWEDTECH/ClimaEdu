/**
 * MyCourseProgressReport
 * 
 * Persona: Student
 * Purpose: Show the student's progress in each enrolled course.
 * Fields:
 * - userId: Identifies the student viewing their own progress
 * - courseId: Identifies the specific course being tracked
 * - institutionId: The institution context for this report
 * - completedLessons: Number of lessons the student has completed
 * - totalLessons: Total number of lessons in the course
 * - progressPercentage: Calculated percentage of course completion (0-100)
 */
export class MyCourseProgressReport {
  private constructor(
    readonly userId: string,
    readonly courseId: string,
    readonly institutionId: string,
    readonly completedLessons: number,
    readonly totalLessons: number,
    readonly progressPercentage: number
  ) {}

  /**
   * Creates a new MyCourseProgressReport instance
   * @param params Report properties
   * @returns A new MyCourseProgressReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    userId: string;
    courseId: string;
    institutionId: string;
    completedLessons: number;
    totalLessons: number;
    progressPercentage?: number;
  }): MyCourseProgressReport {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.completedLessons < 0) {
      throw new Error('Completed lessons cannot be negative');
    }

    if (params.totalLessons < 0) {
      throw new Error('Total lessons cannot be negative');
    }

    if (params.completedLessons > params.totalLessons) {
      throw new Error('Completed lessons cannot exceed total lessons');
    }

    // Calculate progress percentage if not provided
    const progressPercentage = params.progressPercentage !== undefined
      ? params.progressPercentage
      : params.totalLessons === 0
        ? 0
        : Math.round((params.completedLessons / params.totalLessons) * 100);

    // Validate progress percentage
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    return new MyCourseProgressReport(
      params.userId,
      params.courseId,
      params.institutionId,
      params.completedLessons,
      params.totalLessons,
      progressPercentage
    );
  }
}
