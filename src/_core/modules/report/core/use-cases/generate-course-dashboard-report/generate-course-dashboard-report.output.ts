import { BaseReportOutput } from '../../interfaces/BaseReportDTO';

export interface CourseOverview {
  totalCourses: number;
  activeCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  averageEnrollmentsPerCourse: number;
  totalRevenue: number;
  averageRevenuePerCourse: number;
}

export interface CourseMetrics {
  courseId: string;
  courseName: string;
  courseStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number;
  revenue: number;
  revenuePerStudent: number;
  instructorCount: number;
  classCount: number;
  rating: number;
  reviewCount: number;
  lastUpdated: Date;
}

export interface EnrollmentTrend {
  period: string;
  newEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  activeEnrollments: number;
  enrollmentGrowthRate: number;
  completionRate: number;
  retentionRate: number;
}

export interface PerformanceMetrics {
  courseId: string;
  courseName: string;
  averageScore: number;
  passRate: number;
  averageAttempts: number;
  averageTimeSpent: number;
  difficultyRating: 'EASY' | 'MEDIUM' | 'HARD';
  studentSatisfaction: number;
  recommendationRate: number;
  improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface InstructorMetrics {
  instructorId: string;
  instructorName: string;
  coursesAssigned: number;
  totalStudents: number;
  averageClassSize: number;
  studentSatisfactionRating: number;
  responseTime: number;
  engagementScore: number;
  completionRate: number;
  performanceRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
}

export interface RevenueAnalysis {
  totalRevenue: number;
  revenueGrowth: number;
  averageRevenuePerStudent: number;
  topRevenueGeneratingCourses: CourseMetrics[];
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    enrollments: number;
    averagePrice: number;
  }>;
  projectedRevenue: number;
  revenueTargetProgress: number;
}

export interface StudentFeedback {
  courseId: string;
  courseName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
  commonPositiveFeedback: string[];
  commonNegativeFeedback: string[];
  improvementSuggestions: string[];
  npsScore: number;
}

export interface ComparativeAnalysis {
  currentPeriod: {
    totalEnrollments: number;
    completionRate: number;
    averageScore: number;
    revenue: number;
    studentSatisfaction: number;
  };
  comparisonPeriod: {
    totalEnrollments: number;
    completionRate: number;
    averageScore: number;
    revenue: number;
    studentSatisfaction: number;
  };
  changes: {
    enrollmentChange: number;
    completionRateChange: number;
    scoreChange: number;
    revenueChange: number;
    satisfactionChange: number;
  };
  trends: {
    enrollmentTrend: 'UP' | 'DOWN' | 'STABLE';
    performanceTrend: 'UP' | 'DOWN' | 'STABLE';
    revenueTrend: 'UP' | 'DOWN' | 'STABLE';
    satisfactionTrend: 'UP' | 'DOWN' | 'STABLE';
  };
}

export interface ActionableInsight {
  type: 'OPPORTUNITY' | 'RISK' | 'RECOMMENDATION' | 'ALERT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedCourses: string[];
  potentialImpact: string;
  recommendedActions: string[];
  estimatedEffort: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedOutcome: string;
}

export interface GenerateCourseDashboardReportOutput extends BaseReportOutput {
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

  courseOverview: CourseOverview;

  courseMetrics?: CourseMetrics[];

  enrollmentTrends?: EnrollmentTrend[];

  performanceMetrics?: PerformanceMetrics[];

  instructorMetrics?: InstructorMetrics[];

  revenueAnalysis?: RevenueAnalysis;

  studentFeedback?: StudentFeedback[];

  comparativeAnalysis?: ComparativeAnalysis;

  insights: {
    topPerformingCourses: CourseMetrics[];
    underperformingCourses: CourseMetrics[];
    fastestGrowingCourses: CourseMetrics[];
    highestRevenueCourses: CourseMetrics[];
    mostSatisfiedStudentsCourses: CourseMetrics[];
    coursesNeedingAttention: CourseMetrics[];
    actionableInsights: ActionableInsight[];
    keyMetrics: {
      totalStudentsServed: number;
      overallCompletionRate: number;
      averageStudentSatisfaction: number;
      totalRevenueGenerated: number;
      courseCatalogGrowth: number;
      instructorUtilization: number;
    };
  };

  recommendations: {
    courseImprovements: string[];
    instructorDevelopment: string[];
    marketingOpportunities: string[];
    operationalOptimizations: string[];
    revenueEnhancement: string[];
    studentExperienceEnhancements: string[];
  };
}
