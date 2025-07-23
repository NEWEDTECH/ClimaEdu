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
import { User } from '../../../../user/core/entities/User';
import { LessonProgress } from '../../../../content/core/entities/LessonProgress';
import { Enrollment } from '../../../../enrollment/core/entities/Enrollment';
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
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository
  ) {}

  async execute(input: GenerateIndividualStudentReportInput): Promise<GenerateIndividualStudentReportOutput> {
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
      ? await this.buildProgressDetails(input, filteredProgresses)
      : undefined;

    const assessmentPerformance = input.includeAssessments 
      ? await this.buildAssessmentPerformance(input.studentId, input.institutionId)
      : undefined;

    const engagementMetrics = input.includeEngagement 
      ? this.buildEngagementMetrics(filteredProgresses, analysisPeriod)
      : undefined;

    const feedbackHistory = input.includeFeedbackHistory 
      ? this.buildFeedbackHistory()
      : undefined;

    const classComparison = input.includeClassComparison 
      ? await this.buildClassComparison(input, filteredProgresses)
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
        courseId: input.courseId,
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
      enrollmentDate: institutionEnrollment?.enrolledAt || new Date(),
      lastLoginDate: new Date(), // Simplified - would come from user activity tracking
      status: 'ACTIVE', // Simplified
      profileCompleteness: 85 // Simplified - would be calculated based on profile fields
    };
  }

  private async buildProgressDetails(
    input: GenerateIndividualStudentReportInput,
    lessonProgresses: LessonProgress[]
  ): Promise<DetailedProgress[]> {
    const progressDetails: DetailedProgress[] = [];

    // Get courses the student is enrolled in
    const enrollments = await this.enrollmentRepository.listByUser(input.studentId);
    const relevantEnrollments = enrollments.filter((e: Enrollment) => 
      e.institutionId === input.institutionId &&
      (!input.courseId || e.courseId === input.courseId)
    );

    for (const enrollment of relevantEnrollments) {
      try {
        const course = await this.courseRepository.findById(enrollment.courseId);
        if (!course) continue;

        // Filter progresses for this course
        const courseProgresses = lessonProgresses.filter(() => 
          // Simplified - in real implementation, would need to map lessons to courses
          true
        );

        const totalLessons = 20; // Simplified - would get from course structure
        const completedLessons = courseProgresses.filter(p => p.isCompleted()).length;
        const timeSpent = courseProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
        const averageSessionTime = courseProgresses.length > 0 ? timeSpent / courseProgresses.length : 0;
        const lastActivity = courseProgresses.length > 0 
          ? new Date(Math.max(...courseProgresses.map(p => p.lastAccessedAt.getTime())))
          : new Date();

        progressDetails.push({
          courseId: course.id,
          courseName: course.title,
          overallProgress: Math.round((completedLessons / totalLessons) * 100),
          lessonsCompleted: completedLessons,
          totalLessons,
          modulesCompleted: Math.floor(completedLessons / 5), // Simplified
          totalModules: Math.ceil(totalLessons / 5), // Simplified
          estimatedCompletionDate: this.calculateEstimatedCompletion(completedLessons, totalLessons),
          timeSpent,
          averageSessionTime: Math.round(averageSessionTime),
          lastActivity,
          progressByModule: this.buildModuleProgress()
        });

      } catch {
        // Skip courses that can't be loaded
        continue;
      }
    }

    return progressDetails;
  }

  private calculateEstimatedCompletion(completed: number, total: number): Date | undefined {
    if (completed === 0) return undefined;
    
    const remainingLessons = total - completed;
    const averageLessonsPerWeek = 2; // Simplified assumption
    const weeksToComplete = Math.ceil(remainingLessons / averageLessonsPerWeek);
    
    return new Date(Date.now() + (weeksToComplete * 7 * 24 * 60 * 60 * 1000));
  }

  private buildModuleProgress(): Array<{
    moduleId: string;
    moduleName: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
  }> {
    // Simplified module progress - in real implementation would group by actual modules
    return [
      {
        moduleId: 'module-1',
        moduleName: 'Módulo 1 - Introdução',
        progress: 80,
        lessonsCompleted: 4,
        totalLessons: 5,
        timeSpent: 120
      },
      {
        moduleId: 'module-2',
        moduleName: 'Módulo 2 - Conceitos Básicos',
        progress: 60,
        lessonsCompleted: 3,
        totalLessons: 5,
        timeSpent: 90
      }
    ];
  }

  private async buildAssessmentPerformance(studentId: string, institutionId: string): Promise<AssessmentPerformance> {
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

    return {
      totalAssessments: 0, // Simplified - would need to get total assessments from course
      completedAssessments: institutionSubmissions.length,
      averageScore: Math.round(averageScore),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      improvementTrend: 'stable', // Simplified
      assessmentDetails: institutionSubmissions.map(s => ({
        assessmentId: s.questionnaireId,
        assessmentName: `Questionário ${s.questionnaireId}`, // Simplified
        score: s.score,
        maxScore: 100, // Simplified
        completedAt: s.completedAt,
        attempts: 1, // Simplified
        timeSpent: 0, // Simplified
        difficulty: 'MEDIUM'
      })),
      strengthAreas: [], // Simplified
      weaknessAreas: [] // Simplified
    };
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

    // Calculate study streak (simplified)
    const currentStreak = Math.min(7, uniqueDays);
    const longestStreak = Math.min(14, uniqueDays + 3);

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
        studyStreak: {
          current: currentStreak,
          longest: longestStreak
        }
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
    input: GenerateIndividualStudentReportInput,
    lessonProgresses: LessonProgress[]
  ): Promise<IndividualClassComparison> {
    // Simplified class comparison - in real implementation would compare with actual class data
    const studentScore = lessonProgresses.length * 10; // Simplified scoring
    const classAverage = 150; // Mock class average
    const classSize = 25;
    const studentRank = Math.max(1, Math.floor(Math.random() * classSize));

    return {
      classSize,
      studentRank,
      percentileRank: Math.round(((classSize - studentRank + 1) / classSize) * 100),
      comparisonMetrics: [
        {
          metric: 'Progresso Geral',
          studentValue: studentScore,
          classAverage,
          classMedian: 140,
          studentPerformance: studentScore > classAverage ? 'ABOVE_AVERAGE' : 
                            studentScore < classAverage * 0.8 ? 'BELOW_AVERAGE' : 'AVERAGE'
        },
        {
          metric: 'Tempo de Estudo',
          studentValue: lessonProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0),
          classAverage: 300,
          classMedian: 280,
          studentPerformance: 'AVERAGE'
        }
      ],
      peerComparison: {
        similarStudents: 5,
        betterPerformingStudents: studentRank - 1,
        worsePerformingStudents: classSize - studentRank
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
