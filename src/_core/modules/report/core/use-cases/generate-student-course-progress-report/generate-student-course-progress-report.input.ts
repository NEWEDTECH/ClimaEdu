import { BaseReportInput } from '../../interfaces/BaseReportDTO';

/**
 * Input DTO for generating student course progress report
 * Following CQRS pattern - simple data structure for queries
 */
export interface GenerateStudentCourseProgressReportInput extends BaseReportInput {
  courseId?: string; // Optional: filter by specific course
  includeCompletedCourses?: boolean; // Default: true
  includeInProgressCourses?: boolean; // Default: true
}
