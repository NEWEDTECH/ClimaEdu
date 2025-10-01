import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * NPS (Net Promoter Score) analysis
 */
export interface NPSAnalysis {
  overallNPS: number; // -100 to 100
  totalResponses: number;
  promoters: number; // 9-10 scores
  passives: number; // 7-8 scores
  detractors: number; // 0-6 scores
  promoterPercentage: number;
  passivePercentage: number;
  detractorPercentage: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  benchmarkComparison: {
    industryAverage: number;
    performanceLevel: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  };
  segmentAnalysis: {
    segment: string; // course, tutor, period
    nps: number;
    responses: number;
  }[];
}

/**
 * CSAT (Customer Satisfaction) metrics
 */
export interface CSATMetrics {
  overallCSAT: number; // 0-100 percentage
  totalResponses: number;
  averageRating: number; // 1-5 scale
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  satisfactionLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  categoryBreakdown: {
    category: string; // content, support, platform, etc.
    rating: number;
    responses: number;
  }[];
}

/**
 * Detailed feedback analysis
 */
export interface FeedbackAnalysis {
  totalFeedbacks: number;
  averageRating: number;
  feedbackCategories: {
    category: string;
    count: number;
    percentage: number;
    averageRating: number;
    examples: string[];
  }[];
  commonThemes: {
    theme: string;
    frequency: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  recentFeedbacks: {
    feedbackId: string;
    studentName: string;
    rating: number;
    comment: string;
    category: string;
    date: Date;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }[];
  responseTime: {
    averageHours: number;
    responseRate: number; // percentage of feedbacks that received response
    withinSLA: number; // percentage within service level agreement
  };
}

/**
 * Sentiment analysis of feedback
 */
export interface SentimentAnalysis {
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentimentTrends: {
    period: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  keywordAnalysis: {
    positiveKeywords: {
      word: string;
      frequency: number;
      context: string[];
    }[];
    negativeKeywords: {
      word: string;
      frequency: number;
      context: string[];
    }[];
  };
  emotionalIndicators: {
    satisfaction: number; // 0-100
    frustration: number; // 0-100
    engagement: number; // 0-100
    recommendation: number; // 0-100
  };
}

/**
 * Quality improvement suggestions
 */
export interface ImprovementSuggestions {
  priorityActions: {
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    area: string;
    issue: string;
    suggestion: string;
    expectedImpact: string;
    estimatedEffort: 'LOW' | 'MEDIUM' | 'HIGH';
    timeline: string;
    affectedStudents: number;
  }[];
  quickWins: {
    action: string;
    description: string;
    effort: 'MINIMAL' | 'LOW';
    impact: 'HIGH' | 'MEDIUM';
    timeline: string;
  }[];
  longTermInitiatives: {
    initiative: string;
    description: string;
    goals: string[];
    timeline: string;
    resources: string[];
    expectedROI: string;
  }[];
  benchmarkRecommendations: {
    metric: string;
    currentValue: number;
    targetValue: number;
    actions: string[];
  }[];
}

/**
 * Comparative analysis with previous periods
 */
export interface ComparativeAnalysis {
  comparisonPeriod: {
    current: { startDate: Date; endDate: Date };
    previous: { startDate: Date; endDate: Date };
  };
  metricsComparison: {
    metric: string;
    currentValue: number;
    previousValue: number;
    change: number;
    changePercentage: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  }[];
  significantChanges: {
    metric: string;
    change: number;
    significance: 'MAJOR_IMPROVEMENT' | 'MINOR_IMPROVEMENT' | 'STABLE' | 'MINOR_DECLINE' | 'MAJOR_DECLINE';
    possibleCauses: string[];
  }[];
  performanceHighlights: {
    improvements: string[];
    concerns: string[];
    stableAreas: string[];
  };
}

/**
 * Quality overview metrics
 */
export interface QualityOverview {
  overallQualityScore: number; // 0-100 composite score
  qualityLevel: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'POOR';
  totalResponses: number;
  responseRate: number; // percentage of students who provided feedback
  keyMetrics: {
    nps: number;
    csat: number;
    averageRating: number;
    responseTime: number;
  };
  qualityTrends: {
    period: string;
    qualityScore: number;
    nps: number;
    csat: number;
  }[];
  strengthAreas: string[];
  improvementAreas: string[];
  criticalIssues: string[];
}

/**
 * Output DTO for quality report (for institutions)
 * Following CQRS pattern for read operations
 */
export interface GenerateQualityReportOutput extends BaseReportOutput {
  /**
   * Report metadata
   */
  metadata: ReportMetadata;

  /**
   * Requester information
   */
  requesterId: string;
  requesterName: string;

  /**
   * Analysis period
   */
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };

  /**
   * Quality overview
   */
  qualityOverview: QualityOverview;

  /**
   * NPS analysis (if requested)
   */
  npsAnalysis?: NPSAnalysis;

  /**
   * CSAT metrics (if requested)
   */
  csatMetrics?: CSATMetrics;

  /**
   * Detailed feedback analysis (if requested)
   */
  feedbackAnalysis?: FeedbackAnalysis;

  /**
   * Sentiment analysis (if requested)
   */
  sentimentAnalysis?: SentimentAnalysis;

  /**
   * Improvement suggestions (if requested)
   */
  improvementSuggestions?: ImprovementSuggestions;

  /**
   * Comparative analysis (if requested)
   */
  comparativeAnalysis?: ComparativeAnalysis;

  /**
   * Executive summary
   */
  executiveSummary: {
    overallAssessment: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'CONCERNING' | 'CRITICAL';
    keyFindings: string[];
    majorStrengths: string[];
    criticalConcerns: string[];
    topRecommendations: string[];
    nextSteps: string[];
  };

  /**
   * Filters applied to generate this report
   */
  filtersApplied: {
    courseId?: string;
    tutorId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    includeDetailedFeedback: boolean;
    includeNPSAnalysis: boolean;
    includeCSATMetrics: boolean;
    includeSentimentAnalysis: boolean;
    includeImprovementSuggestions: boolean;
    includeComparativeAnalysis: boolean;
    minimumResponses: number;
    groupBy: string;
  };
}
