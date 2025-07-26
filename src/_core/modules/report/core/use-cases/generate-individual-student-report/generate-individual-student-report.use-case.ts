import { inject, injectable } from 'inversify';
import { GenerateIndividualStudentReportInput } from './generate-individual-student-report.input';
import { 
  GenerateIndividualStudentReportOutput,
  StudentInfo,
  DetailedProgress,
  AssessmentPerformance,
  EngagementMetrics,
  FeedbackHistory,
  IndividualClassComparison,
  LearningAnalytics,
  TutorRecommendations
} from './generate-individual-student-report.output';
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { QuestionnaireSubmissionRepository } from '../../../../content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { QuestionnaireRepository } from '../../../../content/infrastructure/repositories/QuestionnaireRepository';
import type { ClassRepository } from '../../../../enrollment/infrastructure/repositories/ClassRepository';
import { User } from '../../../../user/core/entities/User';
import { LessonProgress } from '../../../../content/core/entities/LessonProgress';
import { QuestionnaireSubmission } from '../../../../content/core/entities/QuestionnaireSubmission';
import { Enrollment, EnrollmentStatus } from '../../../../enrollment/core/entities';
import { ListClassStudentsUseCase } from '../../../../enrollment/core/use-cases/list-class-students';
import { Course } from '../../../../content/core/entities/Course';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating individual student report (for tutors)
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateIndividualStudentReportUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,

    @inject(Register.content.repository.QuestionnaireRepository)
    private readonly questionnaireRepository: QuestionnaireRepository,

    @inject(ListClassStudentsUseCase)
    private readonly listClassStudentsUseCase: ListClassStudentsUseCase,

    @inject(Register.enrollment.repository.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: GenerateIndividualStudentReportInput): Promise<GenerateIndividualStudentReportOutput> {
    // Validate class exists and has a course
    if (!input.classId) {
      throw new Error('Class ID is required');
    }
    const studentClass = await this.classRepository.findById(input.classId);
    if (!studentClass || !studentClass.courseId) {
      throw new Error('Class not found or not associated with a course');
    }
    const courseId = studentClass.courseId;

    // Validate tutor exists
    const tutor = await this.userRepository.findById(input.tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    // Validate student exists and get student info
    const student = await this.userRepository.findById(input.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Get analysis period
    const analysisPeriod = this.getAnalysisPeriod(input);

    // Build student basic information
    const studentInfo = await this.buildStudentInfo(student, input);

    // Get student's lesson progresses
    const lessonProgresses = await this.lessonProgressRepository.findByUserAndInstitution(
      input.studentId,
      input.institutionId
    );

    // Filter by date range
    const filteredProgresses = lessonProgresses.filter(progress => 
      progress.lastAccessedAt >= analysisPeriod.startDate && 
      progress.lastAccessedAt <= analysisPeriod.endDate
    );

    // Build optional sections based on input flags
    const progressDetails = input.includeProgressDetails 
      ? await this.buildProgressDetails(input, filteredProgresses, analysisPeriod, courseId)
      : undefined;

    const enrollments = await this.enrollmentRepository.listByUser(input.studentId);

    const assessmentPerformance = input.includeAssessments 
      ? await this.buildAssessmentPerformance(input.studentId, input.institutionId, enrollments, courseId)
      : undefined;

    const engagementMetrics = input.includeEngagement 
      ? this.buildEngagementMetrics(filteredProgresses, analysisPeriod)
      : undefined;

    const feedbackHistory = input.includeFeedbackHistory 
      ? this.buildFeedbackHistory()
      : undefined;

    const classComparison = input.includeClassComparison && input.classId
      ? await this.buildClassComparison(input)
      : undefined;

    // Always build learning analytics and recommendations
    const learningAnalytics = this.buildLearningAnalytics(filteredProgresses);
    const recommendations = this.buildTutorRecommendations(
      filteredProgresses,
      assessmentPerformance,
      engagementMetrics
    );

    // Build overall summary
    const summary = this.buildOverallSummary(
      filteredProgresses,
      assessmentPerformance,
      engagementMetrics
    );

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'IndividualStudentReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['LessonProgress', 'Enrollment', 'User', 'Course'],
        totalRecords: filteredProgresses.length
      },
      tutorId: input.tutorId,
      tutorName: tutor.name,
      studentInfo,
      analysisPeriod,
      progressDetails,
      assessmentPerformance,
      engagementMetrics,
      feedbackHistory,
      classComparison,
      learningAnalytics,
      recommendations,
      summary,
      filtersApplied: {
        classId: input.classId,
        courseId: courseId,
        dateRange: input.dateFrom && input.dateTo ? {
          from: input.dateFrom,
          to: input.dateTo
        } : undefined,
        includeProgressDetails: input.includeProgressDetails ?? true,
        includeAssessments: input.includeAssessments ?? true,
        includeEngagement: input.includeEngagement ?? true,
        includeFeedbackHistory: input.includeFeedbackHistory ?? false,
        includeClassComparison: input.includeClassComparison ?? true,
        analysisDepth: input.analysisDepth || 'detailed'
      }
    };
  }

  private getAnalysisPeriod(input: GenerateIndividualStudentReportInput): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  } {
    const endDate = input.dateTo || new Date();
    const startDate = input.dateFrom || new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return { startDate, endDate, totalDays };
  }

  private async buildStudentInfo(student: User, input: GenerateIndividualStudentReportInput): Promise<StudentInfo> {
    // Get enrollment information
    const enrollments = await this.enrollmentRepository.listByUser(input.studentId);
    const institutionEnrollment = enrollments.find((e: Enrollment) => e.institutionId === input.institutionId);
    
    return {
      studentId: student.id,
      studentName: student.name,
      email: student.email.value,
      enrollmentDate: institutionEnrollment?.enrolledAt ?? student.createdAt,
      // TODO: This should come from a dedicated user activity tracking system
      lastLoginDate: new Date(), // Simplified
      status: this.mapEnrollmentStatusToStudentInfoStatus(institutionEnrollment?.status),
      // TODO: Implement a real calculation based on the user's profile fields
      profileCompleteness: 85, // Simplified
    };
  }

  private mapEnrollmentStatusToStudentInfoStatus(
    status?: EnrollmentStatus
  ): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' {
    if (!status) {
      return 'INACTIVE';
    }

    switch (status) {
      case EnrollmentStatus.ENROLLED:
      case EnrollmentStatus.COMPLETED:
        return 'ACTIVE';
      case EnrollmentStatus.CANCELLED:
        return 'INACTIVE';
      default:
        return 'INACTIVE';
    }
  }

  private async buildProgressDetails(
    input: GenerateIndividualStudentReportInput,
    lessonProgresses: LessonProgress[],
    analysisPeriod: { totalDays: number },
    courseId: string
  ): Promise<DetailedProgress[]> {
    const progressDetails: DetailedProgress[] = [];

    // Get the student's enrollment for the specific course
    const enrollments = await this.enrollmentRepository.listByUser(input.studentId);
    const relevantEnrollment = enrollments.find((e: Enrollment) => 
      e.institutionId === input.institutionId && e.courseId === courseId
    );

    if (relevantEnrollment) {
      try {
        const course = await this.courseRepository.findById(courseId);
        if (!course) return [];

        // Get all lesson IDs for the current course
        const courseLessonIds = new Set(
          course.modules.flatMap(module => module.lessons.map(lesson => lesson.id))
        );

        // Filter progresses for this course
        const courseProgresses = lessonProgresses.filter(p => courseLessonIds.has(p.lessonId));

        const totalLessons = courseLessonIds.size;
        const completedLessons = courseProgresses.filter(p => p.isCompleted()).length;
        const timeSpent = courseProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
        const averageSessionTime = courseProgresses.length > 0 ? timeSpent / courseProgresses.length : 0;
        const lastActivity = courseProgresses.length > 0 
          ? new Date(Math.max(...courseProgresses.map(p => p.lastAccessedAt.getTime())))
          : relevantEnrollment.enrolledAt;

        const progressByModule = this.buildModuleProgress(course, courseProgresses);
        const modulesCompleted = progressByModule.filter(m => m.progress === 100).length;

        progressDetails.push({
          courseId: course.id,
          courseName: course.title,
          overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          lessonsCompleted: completedLessons,
          totalLessons,
          modulesCompleted,
          totalModules: course.modules.length,
          estimatedCompletionDate: this.calculateEstimatedCompletion(
            completedLessons,
            totalLessons,
            courseProgresses,
            analysisPeriod
          ),
          timeSpent,
          averageSessionTime: Math.round(averageSessionTime),
          lastActivity,
          progressByModule,
        });

      } catch {
        // Skip if course can't be loaded
      }
    }

    return progressDetails;
  }

  private calculateEstimatedCompletion(
    completed: number,
    total: number,
    progresses: LessonProgress[],
    analysisPeriod: { totalDays: number }
  ): Date | undefined {
    if (completed === 0) return undefined;

    const completedInPeriod = progresses.filter(p => p.isCompleted()).length;
    const weeksInPeriod = analysisPeriod.totalDays / 7;
    
    // Avoid division by zero and ensure the period is meaningful
    const averageLessonsPerWeek = weeksInPeriod > 1 ? completedInPeriod / weeksInPeriod : 2;

    if (averageLessonsPerWeek === 0) return undefined;

    const remainingLessons = total - completed;
    const weeksToComplete = Math.ceil(remainingLessons / averageLessonsPerWeek);

    return new Date(Date.now() + weeksToComplete * 7 * 24 * 60 * 60 * 1000);
  }

  private buildModuleProgress(
    course: Course,
    courseProgresses: LessonProgress[]
  ): Array<{
    moduleId: string;
    moduleName: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
  }> {
    return course.modules.map(module => {
      const moduleLessonIds = new Set(module.lessons.map(lesson => lesson.id));
      const moduleProgresses = courseProgresses.filter(p => moduleLessonIds.has(p.lessonId));
      
      const totalLessonsInModule = moduleLessonIds.size;
      const completedLessonsInModule = moduleProgresses.filter(p => p.isCompleted()).length;
      const timeSpentOnModule = moduleProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
      const progress = totalLessonsInModule > 0 ? Math.round((completedLessonsInModule / totalLessonsInModule) * 100) : 0;

      return {
        moduleId: module.id,
        moduleName: module.title,
        progress,
        lessonsCompleted: completedLessonsInModule,
        totalLessons: totalLessonsInModule,
        timeSpent: timeSpentOnModule,
      };
    });
  }

  private async buildAssessmentPerformance(
    studentId: string,
    institutionId: string,
    enrollments: Enrollment[],
    courseId: string
  ): Promise<AssessmentPerformance> {
    let totalAssessments = 0;
    const course = await this.courseRepository.findById(courseId);
      if (course) {
        for (const courseModule of course.modules) {
          for (const lesson of courseModule.lessons) {
            if (lesson.questionnaire) {
              totalAssessments++;
            }
          }
        }
      }

    const submissions = await this.questionnaireSubmissionRepository.listByUser(studentId);
    const institutionSubmissions = submissions.filter(s => s.institutionId === institutionId);

    if (institutionSubmissions.length === 0) {
      return {
        totalAssessments: 0,
        completedAssessments: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        improvementTrend: 'stable',
        assessmentDetails: [],
        strengthAreas: [],
        weaknessAreas: []
      };
    }

    const scores = institutionSubmissions.map(s => s.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const assessmentDetails = await Promise.all(
      institutionSubmissions.map(async s => {
        const questionnaire = await this.questionnaireRepository.findById(s.questionnaireId);
        const attempts = institutionSubmissions.filter(sub => sub.questionnaireId === s.questionnaireId).length;
        
        return {
          assessmentId: s.questionnaireId,
          assessmentName: questionnaire?.title ?? `Questionário ${s.questionnaireId}`,
          score: s.score,
          // TODO: Calculate maxScore based on the sum of points of each question
          maxScore: 100, // Simplified
          completedAt: s.completedAt,
          attempts,
          // TODO: This should be calculated based on submission start and end times
          timeSpent: 0, // Simplified
          // TODO: Difficulty should be a property of the Questionnaire entity
          difficulty: 'MEDIUM' as 'MEDIUM' | 'EASY' | 'HARD'
        };
      })
    );

    const trend = this.calculateImprovementTrend(institutionSubmissions);

    return {
      totalAssessments,
      completedAssessments: institutionSubmissions.length,
      averageScore: Math.round(averageScore),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      improvementTrend: trend,
      assessmentDetails,
      // TODO: Implement analysis of question categories to identify strengths
      strengthAreas: [], // Simplified
      // TODO: Implement analysis of question categories to identify weaknesses
      weaknessAreas: [] // Simplified
    };
  }

  private calculateImprovementTrend(
    submissions: QuestionnaireSubmission[]
  ): 'improving' | 'stable' | 'declining' {
    if (submissions.length < 2) {
      return 'stable';
    }

    // Group submissions by questionnaire
    const submissionsByQuestionnaire = submissions.reduce((acc, sub) => {
      if (!acc[sub.questionnaireId]) {
        acc[sub.questionnaireId] = [];
      }
      acc[sub.questionnaireId].push(sub);
      return acc;
    }, {} as Record<string, QuestionnaireSubmission[]>);

    let trendScore = 0;
    let comparableAssessments = 0;

    for (const questionnaireId in submissionsByQuestionnaire) {
      const subs = submissionsByQuestionnaire[questionnaireId];
      if (subs.length > 1) {
        subs.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
        const firstScore = subs[0].score;
        const lastScore = subs[subs.length - 1].score;

        if (lastScore > firstScore) {
          trendScore++;
        } else if (lastScore < firstScore) {
          trendScore--;
        }
        comparableAssessments++;
      }
    }

    if (comparableAssessments === 0) {
      return 'stable';
    }

    const averageTrend = trendScore / comparableAssessments;

    if (averageTrend > 0.1) return 'improving';
    if (averageTrend < -0.1) return 'declining';
    return 'stable';
  }

  private calculateStudyStreak(lessonProgresses: LessonProgress[]): { current: number; longest: number } {
    if (lessonProgresses.length === 0) {
      return { current: 0, longest: 0 };
    }

    const accessDates = lessonProgresses
      .map(p => p.lastAccessedAt.toISOString().split('T')[0])
      .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    if (accessDates.length === 0) {
      return { current: 0, longest: 0 };
    }

    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < accessDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        longestStreak = 1;
      } else {
        const diffDays = (accessDates[i].getTime() - accessDates[i - 1].getTime()) / (1000 * 3600 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1; // Reset streak
        }
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    // Check if the streak is current
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastAccessDay = accessDates[accessDates.length - 1];
    const diffFromToday = (today.getTime() - lastAccessDay.getTime()) / (1000 * 3600 * 24);

    if (diffFromToday > 1) {
      currentStreak = 0; // Streak is broken
    }

    return { current: currentStreak, longest: longestStreak };
  }

  private buildEngagementMetrics(
    lessonProgresses: LessonProgress[],
    analysisPeriod: { startDate: Date; endDate: Date; totalDays: number }
  ): EngagementMetrics {
    const totalSessions = lessonProgresses.length;
    const totalTime = lessonProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
    const averageSessionLength = totalSessions > 0 ? totalTime / totalSessions : 0;

    // Calculate login frequency (simplified)
    const uniqueDays = new Set(
      lessonProgresses.map(p => p.lastAccessedAt.toISOString().split('T')[0])
    ).size;

    const dailyAverage = uniqueDays / analysisPeriod.totalDays;
    const weeklyAverage = dailyAverage * 7;
    const monthlyAverage = dailyAverage * 30;

    // Calculate preferred study times
    const hourCounts = new Map<number, number>();
    lessonProgresses.forEach(p => {
      const hour = p.lastAccessedAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const preferredStudyTimes = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    const studyStreak = this.calculateStudyStreak(lessonProgresses);

    return {
      loginFrequency: {
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        weeklyAverage: Math.round(weeklyAverage * 100) / 100,
        monthlyAverage: Math.round(monthlyAverage * 100) / 100,
        lastWeekLogins: Math.min(7, uniqueDays)
      },
      studyPatterns: {
        preferredStudyTimes,
        averageSessionLength: Math.round(averageSessionLength),
        longestSession: Math.max(...lessonProgresses.map(p => p.getTotalTimeSpent()), 0),
        shortestSession: Math.min(...lessonProgresses.map(p => p.getTotalTimeSpent()), 0),
        studyStreak,
      },
      contentInteraction: {
        videosWatched: Math.floor(totalSessions * 0.7),
        documentsRead: Math.floor(totalSessions * 0.5),
        quizzesCompleted: Math.floor(totalSessions * 0.3),
        forumPosts: Math.floor(totalSessions * 0.1),
        questionsAsked: Math.floor(totalSessions * 0.05)
      },
      participationLevel: totalSessions > 20 ? 'HIGH' : totalSessions > 10 ? 'MEDIUM' : 'LOW',
      riskLevel: totalSessions < 5 ? 'HIGH' : totalSessions < 15 ? 'MEDIUM' : 'LOW'
    };
  }

  private buildFeedbackHistory(): FeedbackHistory {
    // Simplified feedback data - in real implementation would query feedback repository
    return {
      totalFeedbacks: 3,
      averageRating: 4.2,
      feedbackDetails: [
        {
          feedbackId: 'feedback-1',
          type: 'TUTOR_FEEDBACK',
          content: 'Excelente progresso nas últimas semanas. Continue assim!',
          rating: 5,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdBy: 'Tutor João',
          category: 'PROGRESS'
        },
        {
          feedbackId: 'feedback-2',
          type: 'SYSTEM_FEEDBACK',
          content: 'Você completou 80% do módulo 1. Parabéns!',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          createdBy: 'Sistema',
          category: 'PROGRESS'
        }
      ],
      improvementActions: [
        {
          actionId: 'action-1',
          description: 'Revisar conceitos do módulo 2',
          status: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ]
    };
  }

  private async buildClassComparison(
    input: GenerateIndividualStudentReportInput
  ): Promise<IndividualClassComparison> {
    // This method requires classId to be present in the input
    if (!input.classId) {
      throw new Error('classId is required for class comparison');
    }

    // Step 1: List all students in the class
    const { students } = await this.listClassStudentsUseCase.execute({
      classId: input.classId,
      institutionId: input.institutionId,
    });

    const classSize = students.length;
    if (classSize === 0) {
      // Cannot compare if the class is empty
      return {
        classSize: 0,
        studentRank: 0,
        percentileRank: 0,
        comparisonMetrics: [],
        peerComparison: {
          similarStudents: 0,
          betterPerformingStudents: 0,
          worsePerformingStudents: 0,
        },
      };
    }

    // Step 2: Collect data for all students in the class
    const allStudentsData = await Promise.all(
      students.map(async (student) => {
        const progresses = await this.lessonProgressRepository.findByUserAndInstitution(
          student.id,
          input.institutionId
        );
        const submissions = await this.questionnaireSubmissionRepository.listByUser(student.id);
        
        const totalTimeSpent = progresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
        const averageScore = submissions.length > 0 
          ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length
          : 0;

        return {
          studentId: student.id,
          totalTimeSpent,
          averageScore,
        };
      })
    );

    // Step 3: Calculate class averages and medians
    const totalTimeSpentAll = allStudentsData.map(d => d.totalTimeSpent);
    const averageScoresAll = allStudentsData.map(d => d.averageScore);

    const classAverageTime = totalTimeSpentAll.reduce((sum, t) => sum + t, 0) / classSize;
    const classAverageScore = averageScoresAll.reduce((sum, s) => sum + s, 0) / classSize;

    // Step 4: Find the current student's data
    const currentStudentData = allStudentsData.find(d => d.studentId === input.studentId);
    if (!currentStudentData) {
      // Should not happen if the student is in the class, but as a safeguard
      throw new Error('Current student not found in class data');
    }

    // Step 5: Calculate student's rank
    const studentRankByScore = allStudentsData.sort((a, b) => b.averageScore - a.averageScore)
      .findIndex(d => d.studentId === input.studentId) + 1;

    const percentileRank = Math.round(((classSize - studentRankByScore + 1) / classSize) * 100);

    return {
      classSize,
      studentRank: studentRankByScore,
      percentileRank,
      comparisonMetrics: [
        {
          metric: 'Desempenho (Média de Notas)',
          studentValue: currentStudentData.averageScore,
          classAverage: classAverageScore,
          classMedian: 0, // Median calculation can be added later
          studentPerformance: currentStudentData.averageScore > classAverageScore ? 'ABOVE_AVERAGE' : 
                            currentStudentData.averageScore < classAverageScore * 0.8 ? 'BELOW_AVERAGE' : 'AVERAGE'
        },
        {
          metric: 'Tempo de Estudo (min)',
          studentValue: currentStudentData.totalTimeSpent,
          classAverage: classAverageTime,
          classMedian: 0, // Median calculation can be added later
          studentPerformance: currentStudentData.totalTimeSpent > classAverageTime ? 'ABOVE_AVERAGE' : 'AVERAGE'
        }
      ],
      peerComparison: {
        similarStudents: 0, // Complex calculation, for later
        betterPerformingStudents: studentRankByScore - 1,
        worsePerformingStudents: classSize - studentRankByScore
      }
    };
  }

  private buildLearningAnalytics(lessonProgresses: LessonProgress[]): LearningAnalytics {
    // Simplified learning analytics - in real implementation would use ML algorithms
    const completedLessons = lessonProgresses.filter(p => p.isCompleted()).length;
    
    // Calculate preferred study time
    const hourCounts = new Map<number, number>();
    lessonProgresses.forEach(p => {
      const hour = p.lastAccessedAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const optimalStudyTime = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 14;

    return {
      learningStyle: 'MIXED', // Would be determined by content interaction patterns
      preferredContentTypes: ['VIDEO', 'INTERACTIVE', 'TEXT'],
      optimalStudyTime,
      learningVelocity: Math.round((completedLessons / 4) * 100) / 100, // lessons per week
      retentionRate: 85, // Simplified
      conceptMastery: [
        {
          concept: 'Conceitos Básicos',
          masteryLevel: 85,
          timeToMaster: 14,
          strugglingAreas: ['Aplicação prática']
        },
        {
          concept: 'Análise Avançada',
          masteryLevel: 65,
          timeToMaster: 21,
          strugglingAreas: ['Interpretação de dados', 'Síntese']
        }
      ]
    };
  }

  private buildTutorRecommendations(
    lessonProgresses: LessonProgress[],
    assessmentPerformance?: AssessmentPerformance,
    engagementMetrics?: EngagementMetrics
  ): TutorRecommendations {
    const immediateActions = [];
    const interventionSuggestions = [];
    const strengths = [];
    const areasForImprovement = [];
    const nextSteps = [];

    // Analyze engagement and provide recommendations
    if (engagementMetrics?.riskLevel === 'HIGH') {
      immediateActions.push({
        priority: 'HIGH' as const,
        action: 'Entrar em contato com o aluno imediatamente',
        reason: 'Baixo engajamento indica risco de evasão',
        expectedOutcome: 'Reengajar o aluno e identificar obstáculos'
      });
    }

    if (lessonProgresses.length > 15) {
      strengths.push('Consistência nos estudos');
      strengths.push('Boa frequência de acesso');
    }

    if (assessmentPerformance?.averageScore && assessmentPerformance.averageScore < 70) {
      areasForImprovement.push('Performance em avaliações');
      interventionSuggestions.push({
        type: 'ACADEMIC' as const,
        suggestion: 'Sessões de reforço em conceitos fundamentais',
        timeline: '2 semanas',
        resources: ['Material de apoio', 'Exercícios extras', 'Tutoria individual']
      });
    }

    if (engagementMetrics?.participationLevel === 'LOW') {
      areasForImprovement.push('Participação em atividades');
      interventionSuggestions.push({
        type: 'MOTIVATIONAL' as const,
        suggestion: 'Implementar estratégias de gamificação',
        timeline: '1 semana',
        resources: ['Sistema de pontos', 'Badges de conquista']
      });
    }

    nextSteps.push('Agendar reunião individual com o aluno');
    nextSteps.push('Revisar plano de estudos personalizado');
    nextSteps.push('Monitorar progresso semanalmente');

    return {
      immediateActions,
      interventionSuggestions,
      strengths: strengths.length > 0 ? strengths : ['Dedicação aos estudos'],
      areasForImprovement: areasForImprovement.length > 0 ? areasForImprovement : ['Consistência'],
      nextSteps
    };
  }

  private buildOverallSummary(
    lessonProgresses: LessonProgress[],
    assessmentPerformance?: AssessmentPerformance,
    engagementMetrics?: EngagementMetrics
  ): {
    overallPerformance: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'POOR';
    keyHighlights: string[];
    mainConcerns: string[];
    progressTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    riskAssessment: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  } {
    const totalSessions = lessonProgresses.length;
    const completedLessons = lessonProgresses.filter(p => p.isCompleted()).length;
    const completionRate = totalSessions > 0 ? (completedLessons / totalSessions) * 100 : 0;

    // Determine overall performance
    let overallPerformance: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'POOR';
    if (completionRate >= 90 && (assessmentPerformance?.averageScore || 0) >= 85) {
      overallPerformance = 'EXCELLENT';
    } else if (completionRate >= 75 && (assessmentPerformance?.averageScore || 0) >= 75) {
      overallPerformance = 'GOOD';
    } else if (completionRate >= 60 && (assessmentPerformance?.averageScore || 0) >= 65) {
      overallPerformance = 'SATISFACTORY';
    } else if (completionRate >= 40) {
      overallPerformance = 'NEEDS_IMPROVEMENT';
    } else {
      overallPerformance = 'POOR';
    }

    const keyHighlights = [];
    const mainConcerns = [];

    if (completionRate > 80) {
      keyHighlights.push(`Alta taxa de conclusão: ${Math.round(completionRate)}%`);
    }

    if (assessmentPerformance && assessmentPerformance.averageScore > 80) {
      keyHighlights.push(`Bom desempenho em avaliações: ${assessmentPerformance.averageScore}%`);
    }

    if (engagementMetrics?.riskLevel === 'HIGH') {
      mainConcerns.push('Alto risco de evasão');
    }

    if (completionRate < 50) {
      mainConcerns.push('Baixa taxa de conclusão de atividades');
    }

    return {
      overallPerformance,
      keyHighlights: keyHighlights.length > 0 ? keyHighlights : ['Estudante ativo na plataforma'],
      mainConcerns: mainConcerns.length > 0 ? mainConcerns : ['Nenhuma preocupação identificada'],
      progressTrend: completionRate > 70 ? 'IMPROVING' : completionRate > 40 ? 'STABLE' : 'DECLINING',
      engagementLevel: engagementMetrics?.participationLevel || 'MEDIUM',
      riskAssessment: engagementMetrics?.riskLevel === 'HIGH' ? 'HIGH_RISK' : 
                     engagementMetrics?.riskLevel === 'MEDIUM' ? 'MEDIUM_RISK' : 'LOW_RISK'
    };
  }
}
