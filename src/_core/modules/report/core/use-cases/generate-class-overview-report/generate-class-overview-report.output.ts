import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Student data in the class overview
 */
export interface ClassStudentData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentId: string;
  enrolledAt: Date;
  
  // Progress metrics
  overallProgress: number; // 0-100 percentage
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessDate: Date;
  daysSinceLastAccess: number;
  
  // Performance metrics
  averageScore: number; // 0-100 from assessments
  assessmentsCompleted: number;
  totalAssessments: number;
  
  // Engagement metrics
  totalStudyTime: number; // in minutes
  averageSessionLength: number; // in minutes
  studyStreak: number; // consecutive days
  
  // Risk assessment
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  
  // Status
  isActive: boolean;
  completionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED_OUT';
  
  // Quick actions
  needsAttention: boolean;
  suggestedActions: string[];
}

/**
 * Class-wide statistics
 */
export interface ClassStatistics {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  droppedOutStudents: number;
  
  // Progress metrics
  averageProgress: number;
  progressDistribution: {
    notStarted: number; // 0%
    beginner: number; // 1-25%
    intermediate: number; // 26-75%
    advanced: number; // 76-99%
    completed: number; // 100%
  };
  
  // Performance metrics
  classAverageScore: number;
  scoreDistribution: {
    excellent: number; // 90-100
    good: number; // 80-89
    satisfactory: number; // 70-79
    needsImprovement: number; // 60-69
    failing: number; // <60
  };
  
  // Engagement metrics
  totalClassStudyTime: number;
  averageStudyTimePerStudent: number;
  mostActiveStudent: {
    studentId: string;
    studentName: string;
    studyTime: number;
  };
  
  // Risk assessment
  studentsAtRisk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

/**
 * Course progress breakdown
 */
export interface CourseProgressBreakdown {
  courseId: string;
  courseTitle: string;
  
  // Module/lesson breakdown
  modules: Array<{
    moduleId: string;
    moduleTitle: string;
    studentsCompleted: number;
    averageCompletionTime: number; // in days
    difficultyRating: number; // 1-5 based on completion rates
    commonStruggles: string[];
  }>;
  
  // Assessment breakdown
  assessments: Array<{
    assessmentId: string;
    assessmentTitle: string;
    averageScore: number;
    passRate: number; // percentage
    attemptsAverage: number;
    commonMistakes: string[];
  }>;
}

/**
 * Alerts and recommendations for the tutor
 */
export interface TutorAlert {
  alertId: string;
  type: 'STUDENT_AT_RISK' | 'LOW_ENGAGEMENT' | 'POOR_PERFORMANCE' | 'DEADLINE_APPROACHING' | 'SYSTEM_ISSUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  description: string;
  affectedStudents: string[];
  suggestedActions: string[];
  createdAt: Date;
  isResolved: boolean;
}

/**
 * Trends and analytics
 */
export interface ClassTrends {
  // Weekly progress trends
  weeklyProgress: Array<{
    week: string; // YYYY-WW format
    averageProgress: number;
    activeStudents: number;
    completedLessons: number;
  }>;
  
  // Engagement patterns
  engagementPatterns: {
    peakStudyHours: number[]; // hours of day (0-23)
    peakStudyDays: string[]; // days of week
    averageSessionsPerWeek: number;
    retentionRate: number; // percentage still active after 30 days
  };
  
  // Performance trends
  performanceTrends: Array<{
    period: string;
    averageScore: number;
    improvementRate: number; // percentage change
    strugglingStudents: number;
  }>;
}

/**
 * Output DTO for class overview report
 * Following CQRS pattern - formatted data ready for presentation
 */
export interface GenerateClassOverviewReportOutput extends BaseReportOutput {
  metadata: ReportMetadata;
  
  // Tutor and class info
  tutorId: string;
  tutorName: string;
  classId?: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  
  // Report period
  reportPeriod: {
    startDate: Date;
    endDate: Date;
    generatedAt: Date;
  };
  
  // Main data
  students: ClassStudentData[];
  classStatistics: ClassStatistics;
  courseProgress: CourseProgressBreakdown[];
  
  // Alerts and recommendations
  alerts: TutorAlert[];
  priorityActions: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    affectedStudents: number;
    estimatedImpact: string;
  }>;
  
  // Analytics
  trends: ClassTrends;
  
  // Comparisons
  benchmarks: {
    institutionAverage: {
      progress: number;
      performance: number;
      engagement: number;
    };
    previousPeriod: {
      progressChange: number;
      performanceChange: number;
      engagementChange: number;
    };
  };
  
  // Quick insights
  insights: {
    topPerformers: Array<{
      studentId: string;
      studentName: string;
      metric: string;
      value: number;
    }>;
    improvementOpportunities: string[];
    successFactors: string[];
    recommendedInterventions: Array<{
      intervention: string;
      targetStudents: string[];
      expectedOutcome: string;
    }>;
  };
  
  // Export options
  exportOptions: {
    csvUrl?: string;
    pdfUrl?: string;
    detailedReportUrl?: string;
  };
  
  // Filters applied
  filtersApplied: {
    classId?: string;
    courseId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    includeInactive: boolean;
    sortBy: string;
    sortOrder: string;
    alertsOnly: boolean;
  };
}
