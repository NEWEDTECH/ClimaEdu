import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Student engagement data
 */
export interface StudentEngagementData {
  studentId: string;
  studentName: string;
  email: string;
  enrollmentDate: Date;
  lastAccessDate: Date;
  daysSinceLastAccess: number;
  engagementScore: number; // 0-100
  engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  totalSessions: number;
  averageSessionDuration: number; // in minutes
  completionRate: number; // percentage
  loginFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  activityTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  interventionStatus: 'NONE' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  lastInterventionDate?: Date;
}

/**
 * Dropout risk analysis
 */
export interface DropoutRiskAnalysis {
  totalStudents: number;
  highRiskStudents: number;
  mediumRiskStudents: number;
  lowRiskStudents: number;
  riskDistribution: {
    highRiskPercentage: number;
    mediumRiskPercentage: number;
    lowRiskPercentage: number;
  };
  criticalStudents: StudentEngagementData[]; // Students requiring immediate attention
  recentDropouts: {
    studentId: string;
    studentName: string;
    lastAccessDate: Date;
    daysSinceLastAccess: number;
    previousEngagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  riskFactors: {
    factor: string;
    affectedStudents: number;
    riskWeight: number;
  }[];
}

/**
 * Engagement trends over time
 */
export interface EngagementTrends {
  periodAnalysis: {
    period: string; // 'Week 1', 'Week 2', etc.
    averageEngagement: number;
    activeStudents: number;
    newDropoutRisks: number;
    recoveredStudents: number;
  }[];
  overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  seasonalPatterns: {
    dayOfWeek: string;
    averageEngagement: number;
    activeStudents: number;
  }[];
  peakEngagementTimes: {
    hour: number;
    engagementLevel: number;
    activeStudents: number;
  }[];
  engagementMilestones: {
    milestone: string;
    date: Date;
    description: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }[];
}

/**
 * Retention metrics
 */
export interface RetentionMetrics {
  overallRetentionRate: number; // percentage
  retentionByPeriod: {
    period: string; // '1 week', '1 month', etc.
    retentionRate: number;
    studentsRetained: number;
    studentsLost: number;
  }[];
  cohortAnalysis: {
    cohortName: string; // enrollment period
    initialSize: number;
    currentSize: number;
    retentionRate: number;
    averageEngagementScore: number;
  }[];
  churnPrediction: {
    nextWeekRisk: number; // predicted number of students at risk
    nextMonthRisk: number;
    confidenceLevel: number; // 0-100
  };
  retentionFactors: {
    factor: string;
    positiveImpact: number; // correlation with retention
    studentsAffected: number;
  }[];
}

/**
 * Intervention recommendations
 */
export interface InterventionRecommendations {
  immediateActions: {
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    studentIds: string[];
    action: string;
    reason: string;
    expectedOutcome: string;
    timeframe: string;
  }[];
  preventiveStrategies: {
    strategy: string;
    targetGroup: 'HIGH_RISK' | 'MEDIUM_RISK' | 'ALL';
    implementation: string;
    expectedImpact: string;
    resources: string[];
  }[];
  engagementBoosts: {
    technique: string;
    description: string;
    targetEngagementLevel: 'LOW' | 'MEDIUM' | 'ALL';
    estimatedEffectiveness: number; // 0-100
  }[];
  followUpSchedule: {
    studentId: string;
    studentName: string;
    nextCheckDate: Date;
    actionType: 'CONTACT' | 'ASSESSMENT' | 'INTERVENTION';
    notes: string;
  }[];
}

/**
 * Class engagement overview
 */
export interface ClassEngagementOverview {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  averageEngagementScore: number;
  engagementDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  classHealthScore: number; // 0-100
  comparisonWithOtherClasses: {
    className: string;
    engagementScore: number;
    retentionRate: number;
    comparison: 'BETTER' | 'SIMILAR' | 'WORSE';
  }[];
  keyInsights: string[];
  concernAreas: string[];
}

/**
 * Output DTO for engagement and retention report (for tutors)
 * Following CQRS pattern for read operations
 */
export interface GenerateEngagementRetentionReportOutput extends BaseReportOutput {
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
   * Analysis period
   */
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };

  /**
   * Class engagement overview
   */
  classOverview: ClassEngagementOverview;

  /**
   * Dropout risk analysis
   */
  dropoutRisk: DropoutRiskAnalysis;

  /**
   * Retention metrics
   */
  retentionMetrics: RetentionMetrics;

  /**
   * Student engagement details (if requested)
   */
  studentDetails?: StudentEngagementData[];

  /**
   * Engagement trends (if requested)
   */
  trends?: EngagementTrends;

  /**
   * Intervention recommendations (if requested)
   */
  recommendations?: InterventionRecommendations;

  /**
   * Summary insights
   */
  summary: {
    overallHealth: 'EXCELLENT' | 'GOOD' | 'CONCERNING' | 'CRITICAL';
    keyFindings: string[];
    urgentActions: string[];
    positiveIndicators: string[];
    riskIndicators: string[];
    trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
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
    riskLevelFilter: string;
    engagementFilter: string;
    includeStudentDetails: boolean;
    includeTrendAnalysis: boolean;
    includeRecommendations: boolean;
    inactivityThreshold: number;
    sortBy: string;
  };
}
