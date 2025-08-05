import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Student basic information
 */
export interface StudentInfo {
  studentId: string;
  studentName: string;
  email?: string;
  enrollmentDate: Date;
  lastLoginDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profileCompleteness: number;
}

/**
 * Detailed progress information
 */
export interface DetailedProgress {
  courseId: string;
  courseName: string;
  overallProgress: number;
  lessonsCompleted: number;
  totalLessons: number;
  modulesCompleted: number;
  totalModules: number;
  estimatedCompletionDate?: Date;
  timeSpent: number; // in minutes
  averageSessionTime: number;
  lastActivity: Date;
  progressByModule: {
    moduleId: string;
    moduleName: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
  }[];
}

/**
 * Assessment performance data
 */
export interface AssessmentPerformance {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  assessmentDetails: {
    assessmentId: string;
    assessmentName: string;
    score: number;
    maxScore: number;
    completedAt: Date;
    attempts: number;
    timeSpent: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }[];
  strengthAreas: string[];
  weaknessAreas: string[];
}

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  loginFrequency: {
    dailyAverage: number;
    weeklyAverage: number;
    monthlyAverage: number;
    lastWeekLogins: number;
  };
  studyPatterns: {
    preferredStudyTimes: number[]; // hours of day
    averageSessionLength: number;
    longestSession: number;
    shortestSession: number;
    studyStreak: {
      current: number;
      longest: number;
    };
  };
  contentInteraction: {
    videosWatched: number;
    documentsRead: number;
    quizzesCompleted: number;
    forumPosts: number;
    questionsAsked: number;
  };
  participationLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // dropout risk
}

/**
 * Feedback history
 */
export interface FeedbackHistory {
  totalFeedbacks: number;
  averageRating: number;
  feedbackDetails: {
    feedbackId: string;
    type: 'TUTOR_FEEDBACK' | 'PEER_FEEDBACK' | 'SYSTEM_FEEDBACK';
    content: string;
    rating?: number;
    createdAt: Date;
    createdBy: string;
    category: 'PROGRESS' | 'PERFORMANCE' | 'BEHAVIOR' | 'TECHNICAL';
  }[];
  improvementActions: {
    actionId: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    createdAt: Date;
    dueDate?: Date;
    completedAt?: Date;
  }[];
}

/**
 * Class comparison data
 */
export interface IndividualClassComparison {
  classSize: number;
  studentRank: number;
  percentileRank: number;
  comparisonMetrics: {
    metric: string;
    studentValue: number;
    classAverage: number;
    classMedian: number;
    studentPerformance: 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
  }[];
  peerComparison: {
    similarStudents: number;
    betterPerformingStudents: number;
    worsePerformingStudents: number;
  };
}

/**
 * Learning analytics and insights
 */
export interface LearningAnalytics {
  learningStyle: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'MIXED';
  preferredContentTypes: string[];
  optimalStudyTime: number; // hour of day
  learningVelocity: number; // lessons per week
  retentionRate: number; // percentage
  conceptMastery: {
    concept: string;
    masteryLevel: number; // 0-100
    timeToMaster: number; // days
    strugglingAreas: string[];
  }[];
}

/**
 * Tutor recommendations
 */
export interface TutorRecommendations {
  immediateActions: {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    reason: string;
    expectedOutcome: string;
  }[];
  interventionSuggestions: {
    type: 'ACADEMIC' | 'MOTIVATIONAL' | 'TECHNICAL' | 'BEHAVIORAL';
    suggestion: string;
    timeline: string;
    resources: string[];
  }[];
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string[];
}

/**
 * Output DTO for individual student report (for tutors)
 * Following CQRS pattern for read operations
 */
export interface GenerateIndividualStudentReportOutput extends BaseReportOutput {
  /**
   * Report metadata
   */
  metadata: ReportMetadata;

  /**
   * Tutor information
   */
  tutorId: string;
  tutorName: string;

  /**
   * Student basic information
   */
  studentInfo: StudentInfo;

  /**
   * Analysis period
   */
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };

  /**
   * Detailed progress information (if requested)
   */
  progressDetails?: DetailedProgress[];

  /**
   * Assessment performance (if requested)
   */
  assessmentPerformance?: AssessmentPerformance;

  /**
   * Engagement metrics (if requested)
   */
  engagementMetrics?: EngagementMetrics;

  /**
   * Feedback history (if requested)
   */
  feedbackHistory?: FeedbackHistory;

  /**
   * Class comparison (if requested)
   */
  classComparison?: IndividualClassComparison;

  /**
   * Learning analytics and insights
   */
  learningAnalytics: LearningAnalytics;

  /**
   * Tutor recommendations
   */
  recommendations: TutorRecommendations;

  /**
   * Overall summary
   */
  summary: {
    overallPerformance: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'POOR';
    keyHighlights: string[];
    mainConcerns: string[];
    progressTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    riskAssessment: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  };

  /**
   * Filters applied to generate this report
   */
  filtersApplied: {
    classId: string
    courseId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    includeProgressDetails: boolean;
    includeAssessments: boolean;
    includeEngagement: boolean;
    includeFeedbackHistory: boolean;
    includeClassComparison: boolean;
    analysisDepth: string;
  };
}
