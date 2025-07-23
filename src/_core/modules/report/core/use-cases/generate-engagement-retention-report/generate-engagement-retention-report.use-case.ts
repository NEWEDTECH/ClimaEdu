import { inject, injectable } from 'inversify';
import { GenerateEngagementRetentionReportInput } from './generate-engagement-retention-report.input';
import { 
  GenerateEngagementRetentionReportOutput,
  StudentEngagementData,
  DropoutRiskAnalysis,
  EngagementTrends,
  RetentionMetrics,
  InterventionRecommendations,
  ClassEngagementOverview
} from './generate-engagement-retention-report.output';
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import { LessonProgress } from '../../../../content/core/entities/LessonProgress';
import { Enrollment } from '../../../../enrollment/core/entities/Enrollment';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating engagement and retention report (for tutors)
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateEngagementRetentionReportUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GenerateEngagementRetentionReportInput): Promise<GenerateEngagementRetentionReportOutput> {
    // Validate tutor exists
    const tutor = await this.userRepository.findById(input.tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    // Get analysis period
    const analysisPeriod = this.getAnalysisPeriod(input);

    // Get all enrollments for the institution (filtered by course/class if specified)
    const enrollments = await this.getFilteredEnrollments(input);

    // Get lesson progresses for all students in the analysis period
    const allProgresses = await this.getAllStudentProgresses(enrollments, analysisPeriod);

    // Build student engagement data
    const studentEngagementData = await this.buildStudentEngagementData(
      enrollments, 
      allProgresses, 
      input.inactivityThreshold || 7
    );

    // Apply filters and sorting
    const filteredStudents = this.applyFiltersAndSorting(studentEngagementData, input);

    // Build class overview
    const classOverview = this.buildClassOverview(studentEngagementData);

    // Build dropout risk analysis
    const dropoutRisk = this.buildDropoutRiskAnalysis(studentEngagementData);

    // Build retention metrics
    const retentionMetrics = this.buildRetentionMetrics(studentEngagementData);

    // Build optional sections
    const trends = input.includeTrendAnalysis 
      ? this.buildEngagementTrends(studentEngagementData)
      : undefined;

    const recommendations = input.includeRecommendations 
      ? this.buildInterventionRecommendations(studentEngagementData)
      : undefined;

    // Build summary
    const summary = this.buildSummary(classOverview, dropoutRisk, retentionMetrics, trends);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'EngagementRetentionReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['LessonProgress', 'Enrollment', 'User'],
        totalRecords: studentEngagementData.length
      },
      tutorId: input.tutorId,
      tutorName: tutor.name,
      analysisPeriod,
      classOverview,
      dropoutRisk,
      retentionMetrics,
      studentDetails: input.includeStudentDetails ? filteredStudents : undefined,
      trends,
      recommendations,
      summary,
      filtersApplied: {
        courseId: input.courseId,
        classId: input.classId,
        dateRange: input.dateFrom && input.dateTo ? {
          from: input.dateFrom,
          to: input.dateTo
        } : undefined,
        riskLevelFilter: input.riskLevelFilter || 'ALL',
        engagementFilter: input.engagementFilter || 'ALL',
        includeStudentDetails: input.includeStudentDetails ?? true,
        includeTrendAnalysis: input.includeTrendAnalysis ?? true,
        includeRecommendations: input.includeRecommendations ?? true,
        inactivityThreshold: input.inactivityThreshold || 7,
        sortBy: input.sortBy || 'RISK_LEVEL'
      }
    };
  }

  private getAnalysisPeriod(input: GenerateEngagementRetentionReportInput): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  } {
    const endDate = input.dateTo || new Date();
    const startDate = input.dateFrom || new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return { startDate, endDate, totalDays };
  }

  private async getFilteredEnrollments(input: GenerateEngagementRetentionReportInput): Promise<Enrollment[]> {
    // Get all enrollments for the institution
    const allEnrollments = await this.enrollmentRepository.listByInstitution(input.institutionId);
    
    // Apply filters
    return allEnrollments.filter((enrollment: Enrollment) => {
      if (input.courseId && enrollment.courseId !== input.courseId) {
        return false;
      }
      // Note: classId filter would be implemented when class/turma entity is available
      return true;
    });
  }

  private async getAllStudentProgresses(
    enrollments: Enrollment[], 
    analysisPeriod: { startDate: Date; endDate: Date }
  ): Promise<Map<string, LessonProgress[]>> {
    const progressMap = new Map<string, LessonProgress[]>();

    for (const enrollment of enrollments) {
      try {
        const progresses = await this.lessonProgressRepository.findByUserAndInstitution(
          enrollment.userId,
          enrollment.institutionId
        );

        // Filter by analysis period
        const filteredProgresses = progresses.filter(progress => 
          progress.lastAccessedAt >= analysisPeriod.startDate && 
          progress.lastAccessedAt <= analysisPeriod.endDate
        );

        progressMap.set(enrollment.userId, filteredProgresses);
      } catch {
        // If we can't get progresses for a student, set empty array
        progressMap.set(enrollment.userId, []);
      }
    }

    return progressMap;
  }

  private async buildStudentEngagementData(
    enrollments: Enrollment[],
    progressMap: Map<string, LessonProgress[]>,
    inactivityThreshold: number
  ): Promise<StudentEngagementData[]> {
    const engagementData: StudentEngagementData[] = [];

    for (const enrollment of enrollments) {
      try {
        const user = await this.userRepository.findById(enrollment.userId);
        if (!user) continue;

        const progresses = progressMap.get(enrollment.userId) || [];
        const engagementInfo = this.calculateEngagementMetrics(progresses, inactivityThreshold);

        engagementData.push({
          studentId: user.id,
          studentName: user.name,
          email: user.email.value,
          enrollmentDate: enrollment.enrolledAt,
          lastAccessDate: engagementInfo.lastAccessDate,
          daysSinceLastAccess: engagementInfo.daysSinceLastAccess,
          engagementScore: engagementInfo.engagementScore,
          engagementLevel: engagementInfo.engagementLevel,
          riskLevel: engagementInfo.riskLevel,
          totalSessions: progresses.length,
          averageSessionDuration: engagementInfo.averageSessionDuration,
          completionRate: engagementInfo.completionRate,
          loginFrequency: engagementInfo.loginFrequency,
          activityTrend: engagementInfo.activityTrend,
          interventionStatus: 'NONE', // Simplified - would come from intervention tracking
          lastInterventionDate: undefined
        });
      } catch {
        // Skip students that can't be processed
        continue;
      }
    }

    return engagementData;
  }

  private calculateEngagementMetrics(progresses: LessonProgress[], inactivityThreshold: number): {
    lastAccessDate: Date;
    daysSinceLastAccess: number;
    engagementScore: number;
    engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    averageSessionDuration: number;
    completionRate: number;
    loginFrequency: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    activityTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  } {
    const now = new Date();
    
    // Calculate last access
    const lastAccessDate = progresses.length > 0 
      ? new Date(Math.max(...progresses.map(p => p.lastAccessedAt.getTime())))
      : new Date(0);
    
    const daysSinceLastAccess = Math.floor((now.getTime() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate completion rate
    const completedLessons = progresses.filter(p => p.isCompleted()).length;
    const completionRate = progresses.length > 0 ? (completedLessons / progresses.length) * 100 : 0;

    // Calculate average session duration
    const totalTime = progresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
    const averageSessionDuration = progresses.length > 0 ? totalTime / progresses.length / 60 : 0; // in minutes

    // Calculate login frequency (simplified)
    const uniqueDays = new Set(
      progresses.map(p => p.lastAccessedAt.toISOString().split('T')[0])
    ).size;
    
    const loginFrequency = {
      daily: uniqueDays / 30, // Simplified - assumes 30-day period
      weekly: uniqueDays / 4.3, // Simplified
      monthly: uniqueDays / 1
    };

    // Calculate engagement score (0-100)
    let engagementScore = 0;
    engagementScore += Math.min(completionRate, 100) * 0.4; // 40% weight for completion
    engagementScore += Math.min(loginFrequency.weekly * 10, 100) * 0.3; // 30% weight for frequency
    engagementScore += Math.min(averageSessionDuration * 2, 100) * 0.2; // 20% weight for session duration
    engagementScore += Math.max(0, 100 - daysSinceLastAccess * 10) * 0.1; // 10% weight for recency

    // Determine engagement level
    let engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    if (engagementScore >= 70) {
      engagementLevel = 'HIGH';
    } else if (engagementScore >= 40) {
      engagementLevel = 'MEDIUM';
    } else {
      engagementLevel = 'LOW';
    }

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (daysSinceLastAccess > inactivityThreshold * 2 || engagementScore < 30) {
      riskLevel = 'HIGH';
    } else if (daysSinceLastAccess > inactivityThreshold || engagementScore < 50) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // Calculate activity trend (simplified)
    const activityTrend: 'INCREASING' | 'STABLE' | 'DECREASING' = 
      engagementScore > 60 ? 'INCREASING' : 
      engagementScore > 40 ? 'STABLE' : 'DECREASING';

    return {
      lastAccessDate,
      daysSinceLastAccess,
      engagementScore: Math.round(engagementScore),
      engagementLevel,
      riskLevel,
      averageSessionDuration: Math.round(averageSessionDuration),
      completionRate: Math.round(completionRate),
      loginFrequency,
      activityTrend
    };
  }

  private applyFiltersAndSorting(
    students: StudentEngagementData[], 
    input: GenerateEngagementRetentionReportInput
  ): StudentEngagementData[] {
    let filtered = [...students];

    // Apply risk level filter
    if (input.riskLevelFilter && input.riskLevelFilter !== 'ALL') {
      filtered = filtered.filter(s => s.riskLevel === input.riskLevelFilter);
    }

    // Apply engagement filter
    if (input.engagementFilter && input.engagementFilter !== 'ALL') {
      filtered = filtered.filter(s => s.engagementLevel === input.engagementFilter);
    }

    // Apply sorting
    const sortBy = input.sortBy || 'RISK_LEVEL';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'RISK_LEVEL':
          const riskOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case 'LAST_ACCESS':
          return b.lastAccessDate.getTime() - a.lastAccessDate.getTime();
        case 'ENGAGEMENT_SCORE':
          return b.engagementScore - a.engagementScore;
        case 'NAME':
          return a.studentName.localeCompare(b.studentName);
        default:
          return 0;
      }
    });

    return filtered;
  }

  private buildClassOverview(students: StudentEngagementData[]): ClassEngagementOverview {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.daysSinceLastAccess <= 7).length;
    const inactiveStudents = totalStudents - activeStudents;
    
    const averageEngagementScore = students.length > 0 
      ? students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length 
      : 0;

    const engagementDistribution = {
      high: students.filter(s => s.engagementLevel === 'HIGH').length,
      medium: students.filter(s => s.engagementLevel === 'MEDIUM').length,
      low: students.filter(s => s.engagementLevel === 'LOW').length
    };

    // Calculate class health score (0-100)
    const classHealthScore = Math.round(
      (activeStudents / totalStudents) * 50 + // 50% weight for active students
      (averageEngagementScore * 0.5) // 50% weight for average engagement
    );

    const keyInsights: string[] = [];
    const concernAreas: string[] = [];

    if (averageEngagementScore > 70) {
      keyInsights.push('Alta taxa de engajamento geral da turma');
    }
    if (activeStudents / totalStudents > 0.8) {
      keyInsights.push('Boa retenção de alunos ativos');
    }
    if (engagementDistribution.high / totalStudents > 0.4) {
      keyInsights.push('Grande número de alunos altamente engajados');
    }

    if (averageEngagementScore < 40) {
      concernAreas.push('Baixo engajamento geral da turma');
    }
    if (inactiveStudents / totalStudents > 0.3) {
      concernAreas.push('Alto número de alunos inativos');
    }
    if (engagementDistribution.low / totalStudents > 0.4) {
      concernAreas.push('Muitos alunos com baixo engajamento');
    }

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      averageEngagementScore: Math.round(averageEngagementScore),
      engagementDistribution,
      classHealthScore,
      comparisonWithOtherClasses: [], // Simplified - would compare with other classes
      keyInsights: keyInsights.length > 0 ? keyInsights : ['Turma com desempenho padrão'],
      concernAreas: concernAreas.length > 0 ? concernAreas : ['Nenhuma preocupação identificada']
    };
  }

  private buildDropoutRiskAnalysis(students: StudentEngagementData[]): DropoutRiskAnalysis {
    const totalStudents = students.length;
    const highRiskStudents = students.filter(s => s.riskLevel === 'HIGH').length;
    const mediumRiskStudents = students.filter(s => s.riskLevel === 'MEDIUM').length;
    const lowRiskStudents = students.filter(s => s.riskLevel === 'LOW').length;

    const riskDistribution = {
      highRiskPercentage: totalStudents > 0 ? Math.round((highRiskStudents / totalStudents) * 100) : 0,
      mediumRiskPercentage: totalStudents > 0 ? Math.round((mediumRiskStudents / totalStudents) * 100) : 0,
      lowRiskPercentage: totalStudents > 0 ? Math.round((lowRiskStudents / totalStudents) * 100) : 0
    };

    // Get critical students (high risk + very inactive)
    const criticalStudents = students
      .filter(s => s.riskLevel === 'HIGH' && s.daysSinceLastAccess > 14)
      .slice(0, 10); // Top 10 most critical

    // Identify recent dropouts (students inactive for more than 30 days)
    const recentDropouts = students
      .filter(s => s.daysSinceLastAccess > 30)
      .map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        lastAccessDate: s.lastAccessDate,
        daysSinceLastAccess: s.daysSinceLastAccess,
        previousEngagementLevel: s.engagementLevel
      }))
      .slice(0, 5); // Top 5 recent dropouts

    const riskFactors = [
      {
        factor: 'Inatividade prolongada (>14 dias)',
        affectedStudents: students.filter(s => s.daysSinceLastAccess > 14).length,
        riskWeight: 0.8
      },
      {
        factor: 'Baixa taxa de conclusão (<30%)',
        affectedStudents: students.filter(s => s.completionRate < 30).length,
        riskWeight: 0.6
      },
      {
        factor: 'Sessões muito curtas (<10 min)',
        affectedStudents: students.filter(s => s.averageSessionDuration < 10).length,
        riskWeight: 0.4
      },
      {
        factor: 'Baixa frequência de login (<2x/semana)',
        affectedStudents: students.filter(s => s.loginFrequency.weekly < 2).length,
        riskWeight: 0.5
      }
    ];

    return {
      totalStudents,
      highRiskStudents,
      mediumRiskStudents,
      lowRiskStudents,
      riskDistribution,
      criticalStudents,
      recentDropouts,
      riskFactors
    };
  }

  private buildRetentionMetrics(
    students: StudentEngagementData[]
  ): RetentionMetrics {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.daysSinceLastAccess <= 7).length;
    const overallRetentionRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    const retentionByPeriod = [
      {
        period: '1 semana',
        retentionRate: totalStudents > 0 ? (students.filter(s => s.daysSinceLastAccess <= 7).length / totalStudents) * 100 : 0,
        studentsRetained: students.filter(s => s.daysSinceLastAccess <= 7).length,
        studentsLost: students.filter(s => s.daysSinceLastAccess > 7).length
      },
      {
        period: '2 semanas',
        retentionRate: totalStudents > 0 ? (students.filter(s => s.daysSinceLastAccess <= 14).length / totalStudents) * 100 : 0,
        studentsRetained: students.filter(s => s.daysSinceLastAccess <= 14).length,
        studentsLost: students.filter(s => s.daysSinceLastAccess > 14).length
      },
      {
        period: '1 mês',
        retentionRate: totalStudents > 0 ? (students.filter(s => s.daysSinceLastAccess <= 30).length / totalStudents) * 100 : 0,
        studentsRetained: students.filter(s => s.daysSinceLastAccess <= 30).length,
        studentsLost: students.filter(s => s.daysSinceLastAccess > 30).length
      }
    ];

    // Simplified cohort analysis
    const cohortAnalysis = [
      {
        cohortName: 'Turma Atual',
        initialSize: totalStudents,
        currentSize: activeStudents,
        retentionRate: overallRetentionRate,
        averageEngagementScore: students.length > 0 
          ? students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length 
          : 0
      }
    ];

    // Predict churn risk
    const highRiskStudents = students.filter(s => s.riskLevel === 'HIGH').length;
    const mediumRiskStudents = students.filter(s => s.riskLevel === 'MEDIUM').length;

    const churnPrediction = {
      nextWeekRisk: Math.round(highRiskStudents * 0.7 + mediumRiskStudents * 0.3),
      nextMonthRisk: Math.round(highRiskStudents * 0.9 + mediumRiskStudents * 0.5),
      confidenceLevel: 75 // Simplified confidence level
    };

    const retentionFactors = [
      {
        factor: 'Engajamento alto',
        positiveImpact: 0.8,
        studentsAffected: students.filter(s => s.engagementLevel === 'HIGH').length
      },
      {
        factor: 'Login frequente',
        positiveImpact: 0.6,
        studentsAffected: students.filter(s => s.loginFrequency.weekly >= 3).length
      },
      {
        factor: 'Alta taxa de conclusão',
        positiveImpact: 0.7,
        studentsAffected: students.filter(s => s.completionRate >= 70).length
      }
    ];

    return {
      overallRetentionRate: Math.round(overallRetentionRate),
      retentionByPeriod,
      cohortAnalysis,
      churnPrediction,
      retentionFactors
    };
  }

  private buildEngagementTrends(
    students: StudentEngagementData[]
  ): EngagementTrends {
    // Simplified trend analysis - in real implementation would analyze historical data
    const periodAnalysis = [
      {
        period: 'Semana 1',
        averageEngagement: 65,
        activeStudents: Math.floor(students.length * 0.8),
        newDropoutRisks: 2,
        recoveredStudents: 1
      },
      {
        period: 'Semana 2',
        averageEngagement: 62,
        activeStudents: Math.floor(students.length * 0.75),
        newDropoutRisks: 3,
        recoveredStudents: 0
      },
      {
        period: 'Semana 3',
        averageEngagement: 68,
        activeStudents: Math.floor(students.length * 0.82),
        newDropoutRisks: 1,
        recoveredStudents: 2
      },
      {
        period: 'Semana 4',
        averageEngagement: 70,
        activeStudents: Math.floor(students.length * 0.85),
        newDropoutRisks: 1,
        recoveredStudents: 3
      }
    ];

    const overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 
      periodAnalysis[periodAnalysis.length - 1].averageEngagement > periodAnalysis[0].averageEngagement 
        ? 'IMPROVING' : 'STABLE';

    const seasonalPatterns = [
      { dayOfWeek: 'Segunda', averageEngagement: 65, activeStudents: Math.floor(students.length * 0.7) },
      { dayOfWeek: 'Terça', averageEngagement: 72, activeStudents: Math.floor(students.length * 0.8) },
      { dayOfWeek: 'Quarta', averageEngagement: 75, activeStudents: Math.floor(students.length * 0.85) },
      { dayOfWeek: 'Quinta', averageEngagement: 70, activeStudents: Math.floor(students.length * 0.82) },
      { dayOfWeek: 'Sexta', averageEngagement: 68, activeStudents: Math.floor(students.length * 0.78) },
      { dayOfWeek: 'Sábado', averageEngagement: 45, activeStudents: Math.floor(students.length * 0.4) },
      { dayOfWeek: 'Domingo', averageEngagement: 40, activeStudents: Math.floor(students.length * 0.35) }
    ];

    const peakEngagementTimes = [
      { hour: 14, engagementLevel: 85, activeStudents: Math.floor(students.length * 0.6) },
      { hour: 20, engagementLevel: 90, activeStudents: Math.floor(students.length * 0.7) },
      { hour: 10, engagementLevel: 75, activeStudents: Math.floor(students.length * 0.5) }
    ];

    const engagementMilestones = [
      {
        milestone: 'Início do período',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        description: 'Início da análise de engajamento',
        impact: 'NEUTRAL' as const
      },
      {
        milestone: 'Pico de engajamento',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: 'Maior engajamento registrado no período',
        impact: 'POSITIVE' as const
      }
    ];

    return {
      periodAnalysis,
      overallTrend,
      seasonalPatterns,
      peakEngagementTimes,
      engagementMilestones
    };
  }

  private buildInterventionRecommendations(
    students: StudentEngagementData[]
  ): InterventionRecommendations {
    const highRiskStudents = students.filter(s => s.riskLevel === 'HIGH');
    const criticalStudents = students.filter(s => s.riskLevel === 'HIGH' && s.daysSinceLastAccess > 14);

    const immediateActions = [];
    
    if (criticalStudents.length > 0) {
      immediateActions.push({
        priority: 'CRITICAL' as const,
        studentIds: criticalStudents.slice(0, 5).map(s => s.studentId),
        action: 'Contato imediato por telefone ou email',
        reason: 'Estudantes com alto risco de evasão e inatividade prolongada',
        expectedOutcome: 'Reengajamento ou identificação de obstáculos',
        timeframe: '24 horas'
      });
    }

    if (highRiskStudents.length > criticalStudents.length) {
      immediateActions.push({
        priority: 'HIGH' as const,
        studentIds: highRiskStudents.filter(s => s.daysSinceLastAccess <= 14).slice(0, 10).map(s => s.studentId),
        action: 'Envio de mensagem motivacional personalizada',
        reason: 'Estudantes com alto risco mas ainda acessíveis',
        expectedOutcome: 'Aumento do engajamento',
        timeframe: '48 horas'
      });
    }

    const preventiveStrategies = [
      {
        strategy: 'Gamificação de atividades',
        targetGroup: 'ALL' as const,
        implementation: 'Implementar sistema de pontos e badges para atividades',
        expectedImpact: 'Aumento de 15-20% no engajamento',
        resources: ['Sistema de gamificação', 'Design de badges', 'Regras de pontuação']
      },
      {
        strategy: 'Mentoria entre pares',
        targetGroup: 'MEDIUM_RISK' as const,
        implementation: 'Pareamento de estudantes de alto engajamento com médio risco',
        expectedImpact: 'Redução de 30% no risco de evasão',
        resources: ['Programa de mentoria', 'Treinamento de mentores']
      },
      {
        strategy: 'Conteúdo personalizado',
        targetGroup: 'HIGH_RISK' as const,
        implementation: 'Criação de trilhas de aprendizagem personalizadas',
        expectedImpact: 'Aumento de 25% na retenção',
        resources: ['Análise de perfil', 'Conteúdo adaptativo', 'IA de recomendação']
      }
    ];

    const engagementBoosts = [
      {
        technique: 'Notificações inteligentes',
        description: 'Envio de lembretes personalizados baseados no padrão de estudo',
        targetEngagementLevel: 'LOW' as const,
        estimatedEffectiveness: 70
      },
      {
        technique: 'Sessões de estudo em grupo',
        description: 'Organização de sessões colaborativas online',
        targetEngagementLevel: 'MEDIUM' as const,
        estimatedEffectiveness: 65
      },
      {
        technique: 'Desafios semanais',
        description: 'Criação de desafios temáticos para manter interesse',
        targetEngagementLevel: 'ALL' as const,
        estimatedEffectiveness: 60
      }
    ];

    const followUpSchedule = students
      .filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM')
      .slice(0, 20)
      .map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        nextCheckDate: new Date(Date.now() + (s.riskLevel === 'HIGH' ? 2 : 7) * 24 * 60 * 60 * 1000),
        actionType: s.riskLevel === 'HIGH' ? 'CONTACT' as const : 'ASSESSMENT' as const,
        notes: s.riskLevel === 'HIGH' 
          ? 'Contato urgente necessário - risco crítico de evasão'
          : 'Monitoramento preventivo - acompanhar evolução'
      }));

    return {
      immediateActions,
      preventiveStrategies,
      engagementBoosts,
      followUpSchedule
    };
  }

  private buildSummary(
    classOverview: ClassEngagementOverview,
    dropoutRisk: DropoutRiskAnalysis,
    retentionMetrics: RetentionMetrics,
    trends?: EngagementTrends
  ): {
    overallHealth: 'EXCELLENT' | 'GOOD' | 'CONCERNING' | 'CRITICAL';
    keyFindings: string[];
    urgentActions: string[];
    positiveIndicators: string[];
    riskIndicators: string[];
    trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
  } {
    // Determine overall health
    let overallHealth: 'EXCELLENT' | 'GOOD' | 'CONCERNING' | 'CRITICAL';
    if (classOverview.classHealthScore >= 85 && dropoutRisk.highRiskStudents <= 2) {
      overallHealth = 'EXCELLENT';
    } else if (classOverview.classHealthScore >= 70 && dropoutRisk.highRiskStudents <= 5) {
      overallHealth = 'GOOD';
    } else if (classOverview.classHealthScore >= 50 && dropoutRisk.highRiskStudents <= 10) {
      overallHealth = 'CONCERNING';
    } else {
      overallHealth = 'CRITICAL';
    }

    const keyFindings: string[] = [];
    const urgentActions: string[] = [];
    const positiveIndicators: string[] = [];
    const riskIndicators: string[] = [];

    // Key findings
    keyFindings.push(`${classOverview.totalStudents} estudantes analisados`);
    keyFindings.push(`Taxa de retenção geral: ${retentionMetrics.overallRetentionRate}%`);
    keyFindings.push(`${dropoutRisk.highRiskStudents} estudantes em alto risco`);
    keyFindings.push(`Score de saúde da turma: ${classOverview.classHealthScore}/100`);

    // Urgent actions
    if (dropoutRisk.criticalStudents.length > 0) {
      urgentActions.push(`${dropoutRisk.criticalStudents.length} estudantes precisam de contato imediato`);
    }
    if (dropoutRisk.highRiskStudents > classOverview.totalStudents * 0.2) {
      urgentActions.push('Alto número de estudantes em risco - implementar estratégias preventivas');
    }
    if (retentionMetrics.overallRetentionRate < 70) {
      urgentActions.push('Taxa de retenção baixa - revisar estratégias de engajamento');
    }

    // Positive indicators
    if (classOverview.averageEngagementScore > 70) {
      positiveIndicators.push('Boa média de engajamento da turma');
    }
    if (classOverview.engagementDistribution.high > classOverview.totalStudents * 0.4) {
      positiveIndicators.push('Grande número de estudantes altamente engajados');
    }
    if (retentionMetrics.overallRetentionRate > 80) {
      positiveIndicators.push('Excelente taxa de retenção');
    }

    // Risk indicators
    if (dropoutRisk.highRiskStudents > classOverview.totalStudents * 0.15) {
      riskIndicators.push('Alto percentual de estudantes em risco');
    }
    if (classOverview.inactiveStudents > classOverview.totalStudents * 0.3) {
      riskIndicators.push('Muitos estudantes inativos');
    }
    if (retentionMetrics.churnPrediction.nextWeekRisk > 5) {
      riskIndicators.push('Previsão de alta evasão na próxima semana');
    }

    // Trend direction
    const trendDirection = trends?.overallTrend || 'STABLE';

    return {
      overallHealth,
      keyFindings,
      urgentActions: urgentActions.length > 0 ? urgentActions : ['Nenhuma ação urgente identificada'],
      positiveIndicators: positiveIndicators.length > 0 ? positiveIndicators : ['Turma mantém padrão esperado'],
      riskIndicators: riskIndicators.length > 0 ? riskIndicators : ['Nenhum risco crítico identificado'],
      trendDirection
    };
  }
}
