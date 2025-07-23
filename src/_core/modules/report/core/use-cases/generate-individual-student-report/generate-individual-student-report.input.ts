/**
 * Input DTO for generating individual student report (for tutors)
 * Following Clean Architecture principles - this DTO is in the core layer
 */
export interface GenerateIndividualStudentReportInput {
  /**
   * ID of the tutor requesting the report
   */
  tutorId: string;

  /**
   * ID of the student to analyze
   */
  studentId: string;

  /**
   * ID of the institution
   */
  institutionId: string;

  /**
   * Optional: Filter by specific course
   */
  courseId?: string;

  /**
   * Optional: Date range for analysis
   */
  dateFrom?: Date;
  dateTo?: Date;

  /**
   * Optional: Include detailed progress breakdown
   * @default true
   */
  includeProgressDetails?: boolean;

  /**
   * Optional: Include assessment analysis
   * @default true
   */
  includeAssessments?: boolean;

  /**
   * Optional: Include engagement metrics
   * @default true
   */
  includeEngagement?: boolean;

  /**
   * Optional: Include feedback history
   * @default false
   */
  includeFeedbackHistory?: boolean;

  /**
   * Optional: Include comparison with class average
   * @default true
   */
  includeClassComparison?: boolean;

  /**
   * Optional: Analysis depth level
   * @default 'detailed'
   */
  analysisDepth?: 'summary' | 'detailed' | 'comprehensive';
}
