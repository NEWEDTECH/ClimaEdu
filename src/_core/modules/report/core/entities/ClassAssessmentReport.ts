/**
 * ClassAssessmentReport
 * 
 * Persona: Tutor
 * Purpose: Analyze average assessment results for a class.
 * Fields:
 * - tutorId: Identifies the tutor viewing the report
 * - courseId: Identifies the specific course being analyzed
 * - institutionId: The institution context for this report
 * - averageScore: The average score across all students in the class (0-100)
 * - averageCompletionRate: The average percentage of questionnaires completed (0-100)
 * - numberOfStudents: Total number of students enrolled in the course
 * - numberOfPassedStudents: Number of students who passed all required assessments
 */
export class ClassAssessmentReport {
  private constructor(
    readonly tutorId: string,
    readonly courseId: string,
    readonly institutionId: string,
    readonly averageScore: number,
    readonly averageCompletionRate: number,
    readonly numberOfStudents: number,
    readonly numberOfPassedStudents: number
  ) {}

  /**
   * Creates a new ClassAssessmentReport instance
   * @param params Report properties
   * @returns A new ClassAssessmentReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    tutorId: string;
    courseId: string;
    institutionId: string;
    averageScore: number;
    averageCompletionRate: number;
    numberOfStudents: number;
    numberOfPassedStudents: number;
  }): ClassAssessmentReport {
    if (!params.tutorId || params.tutorId.trim() === '') {
      throw new Error('Tutor ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.averageScore < 0 || params.averageScore > 100) {
      throw new Error('Average score must be between 0 and 100');
    }

    if (params.averageCompletionRate < 0 || params.averageCompletionRate > 100) {
      throw new Error('Average completion rate must be between 0 and 100');
    }

    if (params.numberOfStudents < 0) {
      throw new Error('Number of students cannot be negative');
    }

    if (params.numberOfPassedStudents < 0) {
      throw new Error('Number of passed students cannot be negative');
    }

    if (params.numberOfPassedStudents > params.numberOfStudents) {
      throw new Error('Number of passed students cannot exceed total number of students');
    }

    return new ClassAssessmentReport(
      params.tutorId,
      params.courseId,
      params.institutionId,
      params.averageScore,
      params.averageCompletionRate,
      params.numberOfStudents,
      params.numberOfPassedStudents
    );
  }

  /**
   * Calculates the pass rate as a percentage
   * @returns The percentage of students who passed (0-100)
   */
  public getPassRate(): number {
    if (this.numberOfStudents === 0) {
      return 0;
    }
    return Math.round((this.numberOfPassedStudents / this.numberOfStudents) * 100);
  }
}
