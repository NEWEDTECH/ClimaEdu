export interface GenerateRetentionAnalysisReportInput {
  adminId: string;
  institutionId: string;
  courseId?: string;
  includeDropoutAnalysis?: boolean;
  includeRetentionTrends?: boolean;
  includeRiskFactors?: boolean;
  includeCohortAnalysis?: boolean;
  includeInterventionEffectiveness?: boolean;
  includeComparativeAnalysis?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  cohortPeriod?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  riskThreshold?: number;
  minimumEnrollments?: number;
}
