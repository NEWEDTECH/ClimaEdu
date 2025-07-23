import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Certificate data for a single certificate
 */
export interface CertificateData {
  certificateId: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  issuedAt: Date;
  certificateUrl: string;
  
  // Course completion details
  enrollmentId: string;
  enrolledAt: Date;
  completedAt: Date;
  timeToComplete: number; // in days
  
  // Validation info
  isValid: boolean;
  validationUrl: string;
  
  // Download info
  downloadUrl: string;
  fileSize?: string; // e.g., "2.5 MB"
  fileFormat: string; // e.g., "PDF"
}

/**
 * Summary statistics for certificates
 */
export interface CertificatesSummaryStats {
  totalCertificates: number;
  certificatesThisYear: number;
  certificatesThisMonth: number;
  averageTimeToComplete: number; // in days
  fastestCompletion: {
    courseTitle: string;
    timeToComplete: number;
  } | null;
  slowestCompletion: {
    courseTitle: string;
    timeToComplete: number;
  } | null;
  mostRecentCertificate: {
    courseTitle: string;
    issuedAt: Date;
  } | null;
  oldestCertificate: {
    courseTitle: string;
    issuedAt: Date;
  } | null;
}

/**
 * Certificate achievements over time
 */
export interface CertificateTimeline {
  period: string; // e.g., "2024-01", "Q1 2024"
  certificatesCount: number;
  courseTitles: string[];
}

/**
 * Course categories analysis
 */
export interface CourseCategoryStats {
  category: string;
  certificatesCount: number;
  percentage: number;
  courses: string[];
}

/**
 * Output DTO for student certificates report
 * Following CQRS pattern - formatted data ready for presentation
 */
export interface GenerateStudentCertificatesReportOutput extends BaseReportOutput {
  metadata: ReportMetadata;
  
  // Student info
  studentId: string;
  studentName: string;
  
  // Summary statistics
  summary: CertificatesSummaryStats;
  
  // Detailed certificate data
  certificates: CertificateData[];
  
  // Timeline analysis
  timeline: CertificateTimeline[];
  
  // Category analysis (if course categories are available)
  categoryStats: CourseCategoryStats[];
  
  // Achievements and milestones
  achievements: {
    totalCoursesCompleted: number;
    certificatesPerYear: Record<string, number>;
    longestStreak: {
      startDate: Date;
      endDate: Date;
      certificatesCount: number;
    } | null;
    averageCertificatesPerMonth: number;
  };
  
  // Quick actions
  quickActions: {
    downloadAllUrl?: string;
    shareProfileUrl?: string;
    printFriendlyUrl?: string;
  };
  
  // Filter applied
  filtersApplied: {
    courseId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    sortBy: string;
    sortOrder: string;
  };
}
