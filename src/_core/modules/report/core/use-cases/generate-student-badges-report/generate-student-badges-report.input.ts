import { BaseReportInput } from '../../interfaces/BaseReportDTO';

/**
 * Input DTO for generating student badges report
 * Following CQRS pattern - simple data structure for queries
 */
export interface GenerateStudentBadgesReportInput extends BaseReportInput {
  badgeCategory?: string; // Optional: filter by badge category (e.g., 'COMPLETION', 'STREAK', 'PERFORMANCE')
  earnedOnly?: boolean; // Default: false (show all badges including not earned)
  dateFrom?: Date; // Optional: filter badges earned from date
  dateTo?: Date; // Optional: filter badges earned to date
  sortBy?: 'earnedAt' | 'badgeName' | 'difficulty' | 'category'; // Default: 'earnedAt'
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
  includeProgress?: boolean; // Default: true (include progress towards unearned badges)
}
