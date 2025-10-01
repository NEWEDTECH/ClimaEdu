/**
 * Input DTO for generating student class comparison report
 * Following Clean Architecture principles - this DTO is in the core layer
 */
export interface GenerateStudentClassComparisonReportInput {
  /**
   * ID of the student requesting the report
   */
  userId: string;

  /**
   * ID of the institution
   */
  institutionId: string;

  /**
   * Optional: Filter by specific course
   */
  courseId?: string;

  /**
   * Optional: Filter by specific class/turma
   */
  classId?: string;

  /**
   * Optional: Date range for analysis
   */
  dateFrom?: Date;
  dateTo?: Date;

  /**
   * Optional: Include only active students in comparison
   * @default true
   */
  includeActiveOnly?: boolean;

  /**
   * Optional: Minimum number of activities to be included in comparison
   * @default 5
   */
  minimumActivities?: number;

  /**
   * Optional: Type of comparison metric
   * @default 'overall'
   */
  comparisonType?: 'overall' | 'progress' | 'performance' | 'engagement';

  /**
   * Optional: Include detailed peer analysis
   * @default false
   */
  includeDetailedAnalysis?: boolean;
}
