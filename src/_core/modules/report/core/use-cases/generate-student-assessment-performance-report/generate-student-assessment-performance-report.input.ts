import { BaseReportInput } from '../../interfaces/BaseReportDTO';

/**
 * Input DTO for generating student assessment performance report
 * Following CQRS pattern - simple data structure for queries
 */
export interface GenerateStudentAssessmentPerformanceReportInput extends BaseReportInput {
  courseId?: string; // Optional: filter by specific course
  questionnaireId?: string; // Optional: filter by specific questionnaire
  includePassedOnly?: boolean; // Default: false
  includeFailedOnly?: boolean; // Default: false
  dateFrom?: Date; // Optional: filter submissions from date
  dateTo?: Date; // Optional: filter submissions to date
}
