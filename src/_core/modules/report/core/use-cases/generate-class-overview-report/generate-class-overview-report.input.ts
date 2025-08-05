import { BaseReportInput } from '../../interfaces/BaseReportDTO';

/**
 * Input DTO for generating class overview report
 * Following CQRS pattern - simple data structure for queries
 */
export interface GenerateClassOverviewReportInput extends BaseReportInput {
  tutorId: string; // Required: tutor requesting the report
  classId?: string; // Optional: specific class (if not provided, shows all tutor's classes)
  courseId?: string; // Optional: filter by specific course
  dateFrom?: Date; // Optional: analyze data from date
  dateTo?: Date; // Optional: analyze data to date
  includeInactive?: boolean; // Default: false (exclude inactive students)
  sortBy?: 'studentName' | 'progress' | 'lastAccess' | 'performance'; // Default: 'studentName'
  sortOrder?: 'asc' | 'desc'; // Default: 'asc'
  alertsOnly?: boolean; // Default: false (show only at-risk students)
}
