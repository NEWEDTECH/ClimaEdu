import { BaseReportOutput, ReportMetadata } from '../../interfaces/BaseReportDTO';

/**
 * Time-based study pattern data
 */
export interface TimePattern {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  studyMinutes: number;
  sessionsCount: number;
  averageSessionLength: number;
}

/**
 * Daily study statistics
 */
export interface DailyStudyStats {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessionsCount: number;
  coursesStudied: number;
  longestSession: number;
  mostActiveHour: number;
  productivity: 'low' | 'medium' | 'high';
}

/**
 * Weekly study pattern
 */
export interface WeeklyPattern {
  weekday: string;
  averageMinutes: number;
  sessionsCount: number;
  consistency: number; // 0-100 percentage
}

/**
 * Study session analysis
 */
export interface StudySession {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  contentTypes: string[]; // ['VIDEO', 'PDF', 'QUIZ']
  productivity: 'low' | 'medium' | 'high';
  completionRate: number; // percentage of content completed in session
}

/**
 * Focus and productivity metrics
 */
export interface ProductivityMetrics {
  averageSessionLength: number;
  optimalSessionLength: number;
  focusScore: number; // 0-100
  consistencyScore: number; // 0-100
  peakProductivityHours: number[];
  distractionIndicators: {
    shortSessions: number; // sessions < 10 minutes
    longBreaks: number; // breaks > 2 hours between sessions
    incompleteContent: number; // content started but not finished
  };
}

/**
 * Learning velocity analysis
 */
export interface LearningVelocity {
  contentPerHour: number;
  lessonsPerWeek: number;
  improvementTrend: 'increasing' | 'stable' | 'decreasing';
  velocityByContentType: Record<string, number>;
  peakLearningDays: string[];
}

/**
 * Study environment insights
 */
export interface StudyEnvironment {
  preferredStudyTimes: {
    morning: number; // percentage
    afternoon: number;
    evening: number;
    night: number;
  };
  weekdayVsWeekend: {
    weekdayMinutes: number;
    weekendMinutes: number;
    preference: 'weekday' | 'weekend' | 'balanced';
  };
  sessionDistribution: {
    short: number; // < 30 min
    medium: number; // 30-60 min
    long: number; // > 60 min
  };
}

/**
 * Output DTO for student study habits report
 * Following CQRS pattern - formatted data ready for presentation
 */
export interface GenerateStudentStudyHabitsReportOutput extends BaseReportOutput {
  metadata: ReportMetadata;
  
  // Student info
  studentId: string;
  studentName: string;
  
  // Analysis period
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    activeDays: number;
  };
  
  // Overall statistics
  overallStats: {
    totalStudyTime: number; // in minutes
    totalSessions: number;
    averageDailyTime: number;
    longestStreak: number; // consecutive days
    currentStreak: number;
    totalCoursesStudied: number;
    totalLessonsCompleted: number;
  };
  
  // Time patterns
  timePatterns: {
    hourlyDistribution: TimePattern[];
    dailyStats: DailyStudyStats[];
    weeklyPattern: WeeklyPattern[];
    monthlyTrends: Array<{
      month: string;
      totalMinutes: number;
      averageDailyMinutes: number;
      activeDays: number;
    }>;
  };
  
  // Study sessions
  recentSessions: StudySession[];
  
  // Productivity analysis
  productivity: ProductivityMetrics;
  
  // Learning velocity
  learningVelocity: LearningVelocity;
  
  // Study environment
  studyEnvironment: StudyEnvironment;
  
  // Insights and recommendations
  insights: {
    strengths: string[];
    improvementAreas: string[];
    recommendations: string[];
    habitScore: number; // 0-100
    consistencyRating: 'poor' | 'fair' | 'good' | 'excellent';
    optimalStudySchedule: Array<{
      dayOfWeek: string;
      recommendedHours: number[];
      duration: number;
    }>;
  };
  
  // Comparisons and benchmarks
  benchmarks: {
    averageStudentTime: number;
    percentileRank: number; // where this student ranks (0-100)
    comparisonWithPeers: 'below_average' | 'average' | 'above_average' | 'top_performer';
  };
  
  // Filter applied
  filtersApplied: {
    courseId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    timeZone: string;
    includeWeekends: boolean;
    analysisDepth: string;
  };
}
