import { BaseReportInput } from '../../interfaces/BaseReportDTO';

/**
 * Input DTO for generating student study habits report
 * Following CQRS pattern - simple data structure for queries
 */
export interface GenerateStudentStudyHabitsReportInput extends BaseReportInput {
  courseId?: string; // Optional: filter by specific course
  dateFrom?: Date; // Optional: analyze habits from date
  dateTo?: Date; // Optional: analyze habits to date
  timeZone?: string; // Optional: user's timezone for accurate time analysis (default: UTC)
  includeWeekends?: boolean; // Default: true
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive'; // Default: 'detailed'
}
