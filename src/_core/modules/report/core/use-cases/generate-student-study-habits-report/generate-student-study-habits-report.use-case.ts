import { inject, injectable } from 'inversify';
import { GenerateStudentStudyHabitsReportInput } from './generate-student-study-habits-report.input';
import { GenerateStudentStudyHabitsReportOutput, TimePattern, DailyStudyStats, WeeklyPattern, StudySession, ProductivityMetrics, LearningVelocity, StudyEnvironment } from './generate-student-study-habits-report.output';
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { LessonRepository } from '../../../../content/infrastructure/repositories/LessonRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { ModuleRepository } from '../../../../content/infrastructure/repositories/ModuleRepository';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating student study habits report
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateStudentStudyHabitsReportUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,

    @inject(Register.content.repository.ModuleRepository)
    private readonly moduleRepository: ModuleRepository
  ) {}

  async execute(input: GenerateStudentStudyHabitsReportInput): Promise<GenerateStudentStudyHabitsReportOutput> {
    // Validate user exists and get user info
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get lesson progresses for analysis
    let lessonProgresses = await this.lessonProgressRepository.findByUserAndInstitution(
      input.userId, 
      input.institutionId
    );

    // Apply date filters
    const { startDate, endDate } = this.getAnalysisPeriod(input);
    lessonProgresses = lessonProgresses.filter(progress => 
      progress.lastAccessedAt >= startDate && progress.lastAccessedAt <= endDate
    );

    // Filter by course if specified
    if (input.courseId) {
      const courseLessons = await this.getCourseLessons(input.courseId);
      const courseLessonIds = new Set(courseLessons.map(lesson => lesson.id));
      lessonProgresses = lessonProgresses.filter(progress => 
        courseLessonIds.has(progress.lessonId)
      );
    }

    // Build analysis period info
    const analysisPeriod = {
      startDate,
      endDate,
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      activeDays: this.calculateActiveDays(lessonProgresses)
    };

    // Calculate overall statistics
    const overallStats = await this.calculateOverallStats(lessonProgresses);

    // Analyze time patterns
    const timePatterns = this.analyzeTimePatterns(lessonProgresses);

    // Get recent sessions
    const recentSessions = await this.buildRecentSessions(lessonProgresses.slice(0, 20));

    // Calculate productivity metrics
    const productivity = this.calculateProductivityMetrics(lessonProgresses);

    // Analyze learning velocity
    const learningVelocity = this.analyzeLearningVelocity(lessonProgresses);

    // Analyze study environment
    const studyEnvironment = this.analyzeStudyEnvironment(lessonProgresses);

    // Generate insights
    const insights = this.generateInsights(lessonProgresses, productivity, studyEnvironment);

    // Calculate benchmarks (simplified)
    const benchmarks = this.calculateBenchmarks(overallStats.totalStudyTime, analysisPeriod.totalDays);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'StudentStudyHabitsReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['LessonProgress', 'Course', 'Lesson'],
        totalRecords: lessonProgresses.length
      },
      studentId: input.userId,
      studentName: user.name,
      analysisPeriod,
      overallStats,
      timePatterns,
      recentSessions,
      productivity,
      learningVelocity,
      studyEnvironment,
      insights,
      benchmarks,
      filtersApplied: {
        courseId: input.courseId,
        dateRange: input.dateFrom && input.dateTo ? {
          from: input.dateFrom,
          to: input.dateTo
        } : undefined,
        timeZone: input.timeZone || 'UTC',
        includeWeekends: input.includeWeekends ?? true,
        analysisDepth: input.analysisDepth || 'detailed'
      }
    };
  }

  private getAnalysisPeriod(input: GenerateStudentStudyHabitsReportInput): { startDate: Date; endDate: Date } {
    const endDate = input.dateTo || new Date();
    const startDate = input.dateFrom || new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    return { startDate, endDate };
  }

  private async getCourseLessons(courseId: string): Promise<{ id: string }[]> {
    const courseModules = await this.moduleRepository.listByCourse(courseId);
    let lessons: { id: string }[] = [];
    for (const courseModule of courseModules) {
      const moduleLessons = await this.lessonRepository.listByModule(courseModule.id);
      lessons = lessons.concat(moduleLessons);
    }
    return lessons;
  }

  private calculateActiveDays(lessonProgresses: { lastAccessedAt: Date }[]): number {
    const uniqueDates = new Set(
      lessonProgresses.map(progress => 
        progress.lastAccessedAt.toISOString().split('T')[0]
      )
    );
    return uniqueDates.size;
  }

  private async calculateOverallStats(lessonProgresses: { 
    getTotalTimeSpent(): number; 
    status: string; 
    lessonId: string; 
    lastAccessedAt: Date 
  }[]): Promise<{
    totalStudyTime: number;
    totalSessions: number;
    averageDailyTime: number;
    longestStreak: number;
    currentStreak: number;
    totalCoursesStudied: number;
    totalLessonsCompleted: number;
  }> {
    const totalStudyTime = lessonProgresses.reduce((sum, progress) => 
      sum + progress.getTotalTimeSpent(), 0
    );

    const totalSessions = lessonProgresses.length;
    const activeDays = this.calculateActiveDays(lessonProgresses);
    const averageDailyTime = activeDays > 0 ? totalStudyTime / activeDays : 0;

    const completedLessons = lessonProgresses.filter(p => p.status === 'COMPLETED');
    const totalLessonsCompleted = completedLessons.length;

    // Calculate streaks (simplified)
    const { longestStreak, currentStreak } = this.calculateStreaks(lessonProgresses);

    // Get unique courses (simplified - would need course mapping)
    const uniqueLessons = new Set(lessonProgresses.map(p => p.lessonId));
    const totalCoursesStudied = Math.ceil(uniqueLessons.size / 10); // Rough estimate

    return {
      totalStudyTime,
      totalSessions,
      averageDailyTime: Math.round(averageDailyTime),
      longestStreak,
      currentStreak,
      totalCoursesStudied,
      totalLessonsCompleted
    };
  }

  private calculateStreaks(lessonProgresses: { lastAccessedAt: Date }[]): { longestStreak: number; currentStreak: number } {
    if (lessonProgresses.length === 0) {
      return { longestStreak: 0, currentStreak: 0 };
    }

    // Group by date
    const dateMap = new Map<string, boolean>();
    lessonProgresses.forEach(progress => {
      const dateKey = progress.lastAccessedAt.toISOString().split('T')[0];
      dateMap.set(dateKey, true);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    
    let longestStreak = 1;
    let currentStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak from today backwards
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = sortedDates.indexOf(today);
    
    if (todayIndex >= 0) {
      currentStreak = 1;
      for (let i = todayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(sortedDates[i]);
        const currDate = new Date(sortedDates[i + 1]);
        const dayDiff = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    return { longestStreak, currentStreak };
  }

  private analyzeTimePatterns(
    lessonProgresses: { lastAccessedAt: Date; getTotalTimeSpent(): number }[]
  ): {
    hourlyDistribution: TimePattern[];
    dailyStats: DailyStudyStats[];
    weeklyPattern: WeeklyPattern[];
    monthlyTrends: Array<{ month: string; totalMinutes: number; averageDailyMinutes: number; activeDays: number }>;
  } {
    // Hourly distribution
    const hourlyMap = new Map<number, { minutes: number; sessions: number }>();
    
    lessonProgresses.forEach(progress => {
      const hour = progress.lastAccessedAt.getHours();
      const existing = hourlyMap.get(hour) || { minutes: 0, sessions: 0 };
      hourlyMap.set(hour, {
        minutes: existing.minutes + progress.getTotalTimeSpent(),
        sessions: existing.sessions + 1
      });
    });

    const hourlyDistribution: TimePattern[] = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
      hour,
      dayOfWeek: 0, // Simplified
      studyMinutes: data.minutes,
      sessionsCount: data.sessions,
      averageSessionLength: data.sessions > 0 ? data.minutes / data.sessions : 0
    }));

    // Daily stats
    const dailyMap = new Map<string, { minutes: number; sessions: number; hours: Set<number> }>();
    
    lessonProgresses.forEach(progress => {
      const dateKey = progress.lastAccessedAt.toISOString().split('T')[0];
      const hour = progress.lastAccessedAt.getHours();
      const existing = dailyMap.get(dateKey) || { minutes: 0, sessions: 0, hours: new Set() };
      
      existing.minutes += progress.getTotalTimeSpent();
      existing.sessions += 1;
      existing.hours.add(hour);
      
      dailyMap.set(dateKey, existing);
    });

    const dailyStats: DailyStudyStats[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      totalMinutes: data.minutes,
      sessionsCount: data.sessions,
      coursesStudied: 1, // Simplified
      longestSession: data.minutes, // Simplified
      mostActiveHour: Array.from(data.hours)[0] || 0,
      productivity: data.minutes > 60 ? 'high' : data.minutes > 30 ? 'medium' : 'low'
    }));

    // Weekly pattern
    const weeklyMap = new Map<number, { minutes: number; sessions: number; days: Set<string> }>();
    
    lessonProgresses.forEach(progress => {
      const dayOfWeek = progress.lastAccessedAt.getDay();
      const dateKey = progress.lastAccessedAt.toISOString().split('T')[0];
      const existing = weeklyMap.get(dayOfWeek) || { minutes: 0, sessions: 0, days: new Set() };
      
      existing.minutes += progress.getTotalTimeSpent();
      existing.sessions += 1;
      existing.days.add(dateKey);
      
      weeklyMap.set(dayOfWeek, existing);
    });

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyPattern: WeeklyPattern[] = Array.from(weeklyMap.entries()).map(([dayOfWeek, data]) => ({
      weekday: weekdays[dayOfWeek],
      averageMinutes: data.days.size > 0 ? data.minutes / data.days.size : 0,
      sessionsCount: data.sessions,
      consistency: Math.min(100, (data.days.size / 4) * 100) // Simplified consistency calculation
    }));

    // Monthly trends (simplified)
    const monthlyTrends = [{
      month: new Date().toISOString().substring(0, 7),
      totalMinutes: lessonProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0),
      averageDailyMinutes: 0,
      activeDays: this.calculateActiveDays(lessonProgresses)
    }];

    return {
      hourlyDistribution,
      dailyStats,
      weeklyPattern,
      monthlyTrends
    };
  }

  private async buildRecentSessions(lessonProgresses: { 
    id: string; 
    lessonId: string; 
    lastAccessedAt: Date; 
    getTotalTimeSpent(): number;
    status: string;
  }[]): Promise<StudySession[]> {
    const sessions: StudySession[] = [];

    for (const progress of lessonProgresses.slice(0, 10)) {
      try {
        const lesson = await this.lessonRepository.findById(progress.lessonId);
        if (!lesson) continue;

        const session: StudySession = {
          sessionId: progress.id,
          startTime: progress.lastAccessedAt,
          endTime: new Date(progress.lastAccessedAt.getTime() + (progress.getTotalTimeSpent() * 60 * 1000)),
          duration: progress.getTotalTimeSpent(),
          courseId: 'unknown', // Would need course mapping
          courseTitle: 'Unknown Course',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          contentTypes: ['VIDEO'], // Simplified
          productivity: progress.getTotalTimeSpent() > 30 ? 'high' : 'medium',
          completionRate: progress.status === 'COMPLETED' ? 100 : 50
        };

        sessions.push(session);
      } catch {
        // Skip if lesson not found
        continue;
      }
    }

    return sessions;
  }

  private calculateProductivityMetrics(lessonProgresses: { getTotalTimeSpent(): number }[]): ProductivityMetrics {
    if (lessonProgresses.length === 0) {
      return {
        averageSessionLength: 0,
        optimalSessionLength: 45,
        focusScore: 0,
        consistencyScore: 0,
        peakProductivityHours: [],
        distractionIndicators: {
          shortSessions: 0,
          longBreaks: 0,
          incompleteContent: 0
        }
      };
    }

    const sessionLengths = lessonProgresses.map(p => p.getTotalTimeSpent());
    const averageSessionLength = sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length;
    
    const shortSessions = sessionLengths.filter(length => length < 10).length;
    const focusScore = Math.max(0, 100 - (shortSessions / sessionLengths.length) * 100);
    
    return {
      averageSessionLength: Math.round(averageSessionLength),
      optimalSessionLength: 45,
      focusScore: Math.round(focusScore),
      consistencyScore: Math.min(100, lessonProgresses.length * 2), // Simplified
      peakProductivityHours: [9, 14, 20], // Simplified
      distractionIndicators: {
        shortSessions,
        longBreaks: 0, // Would need session gap analysis
        incompleteContent: lessonProgresses.filter(p => p.getTotalTimeSpent() < 5).length
      }
    };
  }

  private analyzeLearningVelocity(lessonProgresses: { getTotalTimeSpent(): number; status: string }[]): LearningVelocity {
    const totalTime = lessonProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
    const completedLessons = lessonProgresses.filter(p => p.status === 'COMPLETED').length;
    
    return {
      contentPerHour: totalTime > 0 ? (completedLessons / (totalTime / 60)) : 0,
      lessonsPerWeek: completedLessons / 4, // Simplified
      improvementTrend: 'stable',
      velocityByContentType: {
        'VIDEO': 1.2,
        'PDF': 0.8,
        'QUIZ': 2.0
      },
      peakLearningDays: ['Monday', 'Wednesday', 'Friday']
    };
  }

  private analyzeStudyEnvironment(
    lessonProgresses: { lastAccessedAt: Date; getTotalTimeSpent(): number }[]
  ): StudyEnvironment {
    // Time preferences
    let morning = 0, afternoon = 0, evening = 0, night = 0;
    let weekdayMinutes = 0, weekendMinutes = 0;
    let short = 0, medium = 0, long = 0;

    lessonProgresses.forEach(progress => {
      const hour = progress.lastAccessedAt.getHours();
      const dayOfWeek = progress.lastAccessedAt.getDay();
      const duration = progress.getTotalTimeSpent();

      // Time of day
      if (hour >= 6 && hour < 12) morning += duration;
      else if (hour >= 12 && hour < 18) afternoon += duration;
      else if (hour >= 18 && hour < 22) evening += duration;
      else night += duration;

      // Weekday vs weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendMinutes += duration;
      } else {
        weekdayMinutes += duration;
      }

      // Session length
      if (duration < 30) short++;
      else if (duration <= 60) medium++;
      else long++;
    });

    const totalTime = morning + afternoon + evening + night;
    
    return {
      preferredStudyTimes: {
        morning: totalTime > 0 ? Math.round((morning / totalTime) * 100) : 0,
        afternoon: totalTime > 0 ? Math.round((afternoon / totalTime) * 100) : 0,
        evening: totalTime > 0 ? Math.round((evening / totalTime) * 100) : 0,
        night: totalTime > 0 ? Math.round((night / totalTime) * 100) : 0
      },
      weekdayVsWeekend: {
        weekdayMinutes,
        weekendMinutes,
        preference: weekdayMinutes > weekendMinutes ? 'weekday' : 
                   weekendMinutes > weekdayMinutes ? 'weekend' : 'balanced'
      },
      sessionDistribution: {
        short,
        medium,
        long
      }
    };
  }

  private generateInsights(
    lessonProgresses: { getTotalTimeSpent(): number }[],
    productivity: ProductivityMetrics,
    studyEnvironment: StudyEnvironment
  ): {
    strengths: string[];
    improvementAreas: string[];
    recommendations: string[];
    habitScore: number;
    consistencyRating: 'poor' | 'fair' | 'good' | 'excellent';
    optimalStudySchedule: Array<{ dayOfWeek: string; recommendedHours: number[]; duration: number }>;
  } {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths
    if (productivity.averageSessionLength >= 30) {
      strengths.push('Mantém sessões de estudo com duração adequada');
    }
    if (productivity.focusScore >= 70) {
      strengths.push('Demonstra boa capacidade de foco durante os estudos');
    }

    // Analyze improvement areas
    if (productivity.averageSessionLength < 20) {
      improvementAreas.push('Sessões de estudo muito curtas podem reduzir a efetividade');
    }
    if (productivity.distractionIndicators.shortSessions > lessonProgresses.length * 0.3) {
      improvementAreas.push('Muitas sessões interrompidas indicam possíveis distrações');
    }

    // Generate recommendations
    if (studyEnvironment.preferredStudyTimes.evening > 50) {
      recommendations.push('Considere estudar também pela manhã para melhor retenção');
    }
    if (productivity.averageSessionLength < 25) {
      recommendations.push('Tente aumentar a duração das sessões para 30-45 minutos');
    }

    const habitScore = Math.round((productivity.focusScore + productivity.consistencyScore) / 2);
    
    let consistencyRating: 'poor' | 'fair' | 'good' | 'excellent';
    if (productivity.consistencyScore >= 80) consistencyRating = 'excellent';
    else if (productivity.consistencyScore >= 60) consistencyRating = 'good';
    else if (productivity.consistencyScore >= 40) consistencyRating = 'fair';
    else consistencyRating = 'poor';

    const optimalStudySchedule = [
      { dayOfWeek: 'Monday', recommendedHours: [9, 14], duration: 45 },
      { dayOfWeek: 'Wednesday', recommendedHours: [9, 14], duration: 45 },
      { dayOfWeek: 'Friday', recommendedHours: [9, 14], duration: 45 }
    ];

    return {
      strengths,
      improvementAreas,
      recommendations,
      habitScore,
      consistencyRating,
      optimalStudySchedule
    };
  }

  private calculateBenchmarks(totalStudyTime: number, totalDays: number): {
    averageStudentTime: number;
    percentileRank: number;
    comparisonWithPeers: 'below_average' | 'average' | 'above_average' | 'top_performer';
  } {
    const dailyAverage = totalDays > 0 ? totalStudyTime / totalDays : 0;
    const averageStudentTime = 45; // minutes per day (benchmark)
    
    const percentileRank = Math.min(100, Math.round((dailyAverage / averageStudentTime) * 50));
    
    let comparisonWithPeers: 'below_average' | 'average' | 'above_average' | 'top_performer';
    if (dailyAverage >= averageStudentTime * 1.5) comparisonWithPeers = 'top_performer';
    else if (dailyAverage >= averageStudentTime * 1.1) comparisonWithPeers = 'above_average';
    else if (dailyAverage >= averageStudentTime * 0.8) comparisonWithPeers = 'average';
    else comparisonWithPeers = 'below_average';

    return {
      averageStudentTime,
      percentileRank,
      comparisonWithPeers
    };
  }
}
