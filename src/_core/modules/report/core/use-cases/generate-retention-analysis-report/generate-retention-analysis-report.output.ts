import { BaseReportOutput } from '../../interfaces/BaseReportDTO';

export interface RetentionOverview {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  overallRetentionRate: number;
  overallCompletionRate: number;
  averageTimeToCompletion: number;
  averageTimeToDropout: number;
}

export interface DropoutAnalysis {
  courseId: string;
  courseName: string;
  totalEnrollments: number;
  dropouts: number;
  dropoutRate: number;
  averageDropoutTime: number;
  commonDropoutPoints: Array<{
    lessonId: string;
    lessonTitle: string;
    dropoutCount: number;
    dropoutPercentage: number;
  }>;
  dropoutReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export interface RetentionTrend {
  period: string;
  newEnrollments: number;
  retainedStudents: number;
  droppedStudents: number;
  retentionRate: number;
  completionRate: number;
  trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
  periodComparison: number;
}

export interface RiskFactor {
  factorType: 'ENGAGEMENT' | 'PERFORMANCE' | 'TIME_BASED' | 'DEMOGRAPHIC';
  factorName: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedStudents: number;
  correlationStrength: number;
  predictiveAccuracy: number;
  recommendedActions: string[];
}

export interface CohortAnalysis {
  cohortId: string;
  cohortName: string;
  startDate: Date;
  initialSize: number;
  currentSize: number;
  completedCount: number;
  droppedCount: number;
  retentionByWeek: Array<{
    week: number;
    retained: number;
    retentionRate: number;
    dropped: number;
  }>;
  averageProgressRate: number;
  projectedCompletion: number;
}

export interface InterventionEffectiveness {
  interventionType: string;
  interventionName: string;
  studentsTargeted: number;
  studentsResponded: number;
  responseRate: number;
  retentionImprovement: number;
  completionImprovement: number;
  costEffectiveness: number;
  recommendedExpansion: boolean;
}

export interface StudentAtRisk {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  lastActivity: Date;
  progressPercentage: number;
  predictedDropoutDate: Date;
  recommendedInterventions: string[];
  contactPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface RetentionComparison {
  currentPeriod: {
    retentionRate: number;
    completionRate: number;
    averageEngagement: number;
    dropoutRate: number;
  };
  comparisonPeriod: {
    retentionRate: number;
    completionRate: number;
    averageEngagement: number;
    dropoutRate: number;
  };
  changes: {
    retentionChange: number;
    completionChange: number;
    engagementChange: number;
    dropoutChange: number;
  };
  benchmarks: {
    industryAverage: number;
    institutionTarget: number;
    bestPerformingCourse: number;
  };
}

export interface RetentionInsight {
  type: 'CRITICAL_RISK' | 'OPPORTUNITY' | 'TREND' | 'ANOMALY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedCourses: string[];
  affectedStudents: number;
  potentialImpact: string;
  recommendedActions: string[];
  timeframe: string;
  expectedOutcome: string;
}

export interface GenerateRetentionAnalysisReportOutput extends BaseReportOutput {
  institutionInfo: {
    institutionId: string;
    institutionName: string;
    adminId: string;
    adminName: string;
    reportPeriod: {
      startDate: Date;
      endDate: Date;
    };
  };

  retentionOverview: RetentionOverview;

  dropoutAnalysis?: DropoutAnalysis[];

  retentionTrends?: RetentionTrend[];

  riskFactors?: RiskFactor[];

  cohortAnalysis?: CohortAnalysis[];

  interventionEffectiveness?: InterventionEffectiveness[];

  studentsAtRisk: StudentAtRisk[];

  retentionComparison?: RetentionComparison;

  insights: {
    criticalRisks: RetentionInsight[];
    improvementOpportunities: RetentionInsight[];
    trendAnalysis: RetentionInsight[];
    anomalies: RetentionInsight[];
    keyMetrics: {
      totalStudentsAnalyzed: number;
      highRiskStudents: number;
      interventionsNeeded: number;
      retentionImprovement: number;
      projectedSavings: number;
    };
  };

  recommendations: {
    immediateActions: string[];
    shortTermStrategies: string[];
    longTermInitiatives: string[];
    interventionPrograms: string[];
    systemImprovements: string[];
    policyChanges: string[];
  };
}
