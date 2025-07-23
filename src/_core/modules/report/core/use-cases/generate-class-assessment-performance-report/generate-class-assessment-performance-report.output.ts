import { BaseReportOutput } from '../../interfaces/BaseReportDTO';

export interface AssessmentOverview {
  totalAssessments: number;
  totalSubmissions: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
  averageAttempts: number;
}

export interface AssessmentStatistics {
  assessmentId: string;
  assessmentName: string;
  assessmentType: 'QUIZ' | 'EXAM' | 'ASSIGNMENT';
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  standardDeviation: number;
  passRate: number;
  averageTimeSpent: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastSubmissionDate: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  questionType: string;
  correctAnswers: number;
  totalAnswers: number;
  successRate: number;
  averageTimeSpent: number;
  difficultyIndex: number;
  discriminationIndex: number;
  commonWrongAnswers: string[];
}

export interface PerformanceTrend {
  period: string;
  averageScore: number;
  submissionCount: number;
  passRate: number;
  participationRate: number;
}

export interface ClassComparison {
  currentClassAverage: number;
  institutionAverage: number;
  courseAverage: number;
  percentileRank: number;
  performanceRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR';
}

export interface RecommendationItem {
  type: 'CONTENT_REVIEW' | 'INDIVIDUAL_SUPPORT' | 'GROUP_ACTIVITY' | 'ASSESSMENT_ADJUSTMENT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  targetStudents?: string[];
  expectedImpact: string;
  implementationSteps: string[];
}

export interface GenerateClassAssessmentPerformanceReportOutput extends BaseReportOutput {
  classInfo: {
    classId: string;
    className: string;
    courseId: string;
    courseName: string;
    tutorId: string;
    tutorName: string;
    totalStudents: number;
    activeStudents: number;
  };
  
  assessmentOverview: AssessmentOverview;
  
  assessmentStatistics?: AssessmentStatistics[];
  
  studentPerformances?: StudentPerformance[];
  
  questionAnalysis?: QuestionAnalysis[];
  
  performanceTrends?: PerformanceTrend[];
  
  classComparison?: ClassComparison;
  
  recommendations?: RecommendationItem[];
  
  insights: {
    topPerformers: StudentPerformance[];
    strugglingStudents: StudentPerformance[];
    mostDifficultAssessments: AssessmentStatistics[];
    easiestAssessments: AssessmentStatistics[];
    improvementOpportunities: string[];
    strengths: string[];
  };
}
