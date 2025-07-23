export interface GenerateCourseDashboardReportInput {
  adminId: string;
  institutionId: string;
  courseId?: string;
  includeEnrollmentTrends?: boolean;
  includePerformanceMetrics?: boolean;
  includeCompletionRates?: boolean;
  includeRevenueData?: boolean;
  includeInstructorMetrics?: boolean;
  includeStudentFeedback?: boolean;
  includeComparativeAnalysis?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  groupBy?: 'COURSE' | 'INSTRUCTOR' | 'DEPARTMENT' | 'TIME_PERIOD';
  comparisonPeriod?: 'PREVIOUS_MONTH' | 'PREVIOUS_QUARTER' | 'PREVIOUS_YEAR' | 'SAME_PERIOD_LAST_YEAR';
  filterByStatus?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED' | 'ALL';
  minimumEnrollments?: number;
}
