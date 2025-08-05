/**
 * Input DTO for generating quality report (for institutions)
 * Following Clean Architecture principles - this DTO is in the core layer
 */
export interface GenerateQualityReportInput {
  /**
   * ID of the institution requesting the report
   */
  institutionId: string;

  /**
   * ID of the user requesting the report (admin/manager)
   */
  requesterId: string;

  /**
   * Optional: Filter by specific course
   */
  courseId?: string;

  /**
   * Optional: Filter by specific tutor
   */
  tutorId?: string;

  /**
   * Optional: Date range for analysis
   */
  dateFrom?: Date;
  dateTo?: Date;

  /**
   * Optional: Include detailed feedback analysis
   * @default true
   */
  includeDetailedFeedback?: boolean;

  /**
   * Optional: Include NPS analysis
   * @default true
   */
  includeNPSAnalysis?: boolean;

  /**
   * Optional: Include CSAT metrics
   * @default true
   */
  includeCSATMetrics?: boolean;

  /**
   * Optional: Include sentiment analysis
   * @default true
   */
  includeSentimentAnalysis?: boolean;

  /**
   * Optional: Include improvement suggestions
   * @default true
   */
  includeImprovementSuggestions?: boolean;

  /**
   * Optional: Include comparative analysis with previous periods
   * @default false
   */
  includeComparativeAnalysis?: boolean;

  /**
   * Optional: Minimum number of responses to consider valid metrics
   * @default 5
   */
  minimumResponses?: number;

  /**
   * Optional: Group results by
   * @default 'OVERALL'
   */
  groupBy?: 'OVERALL' | 'COURSE' | 'TUTOR' | 'PERIOD';
}
