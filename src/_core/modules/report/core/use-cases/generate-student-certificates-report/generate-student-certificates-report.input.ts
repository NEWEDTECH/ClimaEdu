import { BaseReportInput } from '../../interfaces/BaseReportDTO';

/**
 * Input DTO for generating student certificates report
 * Following CQRS pattern - simple data structure for queries
 */
export interface GenerateStudentCertificatesReportInput extends BaseReportInput {
  courseId?: string; // Optional: filter by specific course
  dateFrom?: Date; // Optional: filter certificates issued from date
  dateTo?: Date; // Optional: filter certificates issued to date
  sortBy?: 'issuedAt' | 'courseTitle' | 'certificateNumber'; // Default: 'issuedAt'
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}
