/**
 * Base interface for all report DTOs
 * Following CQRS pattern - reports are read-only data structures
 */
export interface BaseReportInput {
  userId: string;
  institutionId: string;
}

export interface BaseReportOutput {
  generatedAt: Date;
  institutionId: string;
}

/**
 * Common report metadata
 */
export interface ReportMetadata {
  reportType: string;
  generatedAt: Date;
  dataSourcesUsed: string[];
  totalRecords?: number;
}
