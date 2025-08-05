import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Student performance data for comparison
 */
export interface StudentComparisonData {
  studentId: string;
  studentName: string;
  overallScore: number;
  progressPercentage: number;
  studyTimeMinutes: number;
  completedLessons: number;
  averageAssessmentScore: number;
  lastActivityDate: Date;
  isCurrentUser: boolean;
}

/**
 * Ranking information for the student
 */
export interface StudentRanking {
  currentRank: number;
  totalStudents: number;
  percentileRank: number;
  rankingCategory: 'top_10' | 'top_25' | 'top_50' | 'bottom_50' | 'bottom_25';
  pointsToNextRank: number;
  nextRankStudent?: {
    studentName: string;
    score: number;
  };
}

/**
 * Class statistics and averages
 */
export interface StudentClassStatistics {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageScore: number;
  averageStudyTime: number;
  medianProgress: number;
  medianScore: number;
  standardDeviation: {
    progress: number;
    score: number;
    studyTime: number;
  };
}

/**
 * Performance comparison metrics
 */
export interface PerformanceComparison {
  metric: 'progress' | 'score' | 'study_time' | 'engagement';
  studentValue: number;
  classAverage: number;
  classMedian: number;
  percentilePosition: number;
  performanceLevel: 'excellent' | 'above_average' | 'average' | 'below_average' | 'needs_improvement';
  comparisonText: string;
}

/**
 * Peer analysis data
 */
export interface PeerAnalysis {
  similarPerformers: StudentComparisonData[];
  topPerformers: StudentComparisonData[];
  improvementOpportunities: {
    metric: string;
    currentValue: number;
    targetValue: number;
    studentsAtTarget: number;
    actionSuggestion: string;
  }[];
}

/**
 * Gamification elements
 */
export interface GamificationData {
  currentLevel: number;
  experiencePoints: number;
  pointsToNextLevel: number;
  achievements: {
    id: string;
    name: string;
    description: string;
    earnedAt?: Date;
    progress: number;
  }[];
  leaderboardPosition: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
  streaks: {
    current: number;
    longest: number;
    type: 'study_days' | 'lesson_completion' | 'assessment_scores';
  }[];
}

/**
 * Motivational insights and recommendations
 */
export interface MotivationalInsights {
  strengths: string[];
  improvementAreas: string[];
  motivationalMessage: string;
  goalSuggestions: {
    shortTerm: string[];
    longTerm: string[];
  };
  celebrationMoments: {
    achievement: string;
    description: string;
    date: Date;
  }[];
}

/**
 * Output DTO for student class comparison report
 * Following CQRS pattern for read operations
 */
export interface GenerateStudentClassComparisonReportOutput extends BaseReportOutput {
  /**
   * Report metadata
   */
  metadata: ReportMetadata;
  /**
   * Student information
   */
  studentId: string;
  studentName: string;

  /**
   * Class/Course context
   */
  classId?: string;
  className?: string;
  courseId?: string;
  courseName?: string;

  /**
   * Analysis period
   */
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };

  /**
   * Student's ranking in the class
   */
  ranking: StudentRanking;

  /**
   * Class statistics and averages
   */
  classStatistics: StudentClassStatistics;

  /**
   * Detailed performance comparisons
   */
  performanceComparisons: PerformanceComparison[];

  /**
   * Peer analysis (if requested)
   */
  peerAnalysis?: PeerAnalysis;

  /**
   * Gamification elements
   */
  gamification: GamificationData;

  /**
   * Motivational insights and recommendations
   */
  insights: MotivationalInsights;

  /**
   * Historical trend data
   */
  trends: {
    rankingHistory: {
      date: Date;
      rank: number;
      totalStudents: number;
    }[];
    performanceHistory: {
      date: Date;
      score: number;
      classAverage: number;
    }[];
  };

  /**
   * Filters applied to generate this report
   */
  filtersApplied: {
    courseId?: string;
    classId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    includeActiveOnly: boolean;
    minimumActivities: number;
    comparisonType: string;
    includeDetailedAnalysis: boolean;
  };
}
