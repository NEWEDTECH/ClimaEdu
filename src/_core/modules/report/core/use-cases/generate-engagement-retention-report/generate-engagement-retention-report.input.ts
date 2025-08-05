/**
 * Input DTO for generating engagement and retention report (for tutors)
 * Following Clean Architecture principles - this DTO is in the core layer
 */
export interface GenerateEngagementRetentionReportInput {
  /**
   * ID of the tutor requesting the report
   */
  tutorId: string;

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
   * Optional: Risk level filter
   * @default 'ALL'
   */
  riskLevelFilter?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /**
   * Optional: Engagement level filter
   * @default 'ALL'
   */
  engagementFilter?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /**
   * Optional: Include detailed student breakdown
   * @default true
   */
  includeStudentDetails?: boolean;

  /**
   * Optional: Include trend analysis
   * @default true
   */
  includeTrendAnalysis?: boolean;

  /**
   * Optional: Include intervention recommendations
   * @default true
   */
  includeRecommendations?: boolean;

  /**
   * Optional: Minimum days of inactivity to consider dropout risk
   * @default 7
   */
  inactivityThreshold?: number;

  /**
   * Optional: Sort students by
   * @default 'RISK_LEVEL'
   */
  sortBy?: 'RISK_LEVEL' | 'LAST_ACCESS' | 'ENGAGEMENT_SCORE' | 'NAME';
}
