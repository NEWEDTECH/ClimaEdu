import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Assessment performance data for a single questionnaire submission
 */
export interface AssessmentPerformanceData {
  submissionId: string;
  questionnaireId: string;
  questionnaireTitle: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  
  // Performance metrics
  score: number; // Percentage score (0-100)
  passed: boolean;
  attemptNumber: number;
  maxAttempts: number;
  passingScore: number;
  
  // Timing data
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in minutes
  
  // Question details
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  
  // Status
  canRetry: boolean;
  attemptsRemaining: number;
}

/**
 * Summary statistics for assessment performance
 */
export interface AssessmentSummaryStats {
  totalSubmissions: number;
  passedSubmissions: number;
  failedSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeSpent: number; // in minutes
  totalTimeSpent: number; // in minutes
  passRate: number; // percentage
  averageAttempts: number;
  mostDifficultQuestionnaire?: {
    questionnaireId: string;
    title: string;
    averageScore: number;
    passRate: number;
  };
  bestPerformanceQuestionnaire?: {
    questionnaireId: string;
    title: string;
    averageScore: number;
    passRate: number;
  };
}

/**
 * Performance trends over time
 */
export interface PerformanceTrend {
  period: string; // e.g., "2024-01", "Week 1", etc.
  averageScore: number;
  submissionsCount: number;
  passRate: number;
}

/**
 * Output DTO for student assessment performance report
 * Following CQRS pattern - formatted data ready for presentation
 */
export interface GenerateStudentAssessmentPerformanceReportOutput extends BaseReportOutput {
  metadata: ReportMetadata;
  
  // Student info
  studentId: string;
  studentName: string;
  
  // Summary statistics
  summary: AssessmentSummaryStats;
  
  // Detailed assessment data
  assessments: AssessmentPerformanceData[];
  
  // Performance trends
  trends: PerformanceTrend[];
  
  // Insights and recommendations
  insights: {
    improvementAreas: string[];
    strengths: string[];
    recommendations: string[];
    nextRetryOpportunities: Array<{
      questionnaireId: string;
      title: string;
      lastAttemptScore: number;
      attemptsRemaining: number;
    }>;
  };
  
  // Filter applied
  filtersApplied: {
    courseId?: string;
    questionnaireId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    includePassedOnly?: boolean;
    includeFailedOnly?: boolean;
  };
}
