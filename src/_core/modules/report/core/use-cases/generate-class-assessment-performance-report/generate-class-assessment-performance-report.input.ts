export interface GenerateClassAssessmentPerformanceReportInput {
  tutorId: string;
  institutionId: string;
  classId: string;
  courseId?: string;
  includeIndividualScores?: boolean;
  includeStatistics?: boolean;
  includeTrends?: boolean;
  includeQuestionAnalysis?: boolean;
  assessmentType?: 'QUIZ' | 'EXAM' | 'ASSIGNMENT' | 'ALL';
  dateFrom?: Date;
  dateTo?: Date;
  minimumSubmissions?: number;
  groupBy?: 'ASSESSMENT' | 'STUDENT' | 'TOPIC' | 'DATE';
}
