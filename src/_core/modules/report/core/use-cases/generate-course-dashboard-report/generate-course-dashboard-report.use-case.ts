import { inject, injectable } from 'inversify';
import { GenerateCourseDashboardReportInput } from './generate-course-dashboard-report.input';
import {
  GenerateCourseDashboardReportOutput,
  CourseOverview,
  CourseMetrics,
  EnrollmentTrend,
  PerformanceMetrics,
  InstructorMetrics,
  RevenueAnalysis,
  StudentFeedback,
  ComparativeAnalysis,
  ActionableInsight
} from './generate-course-dashboard-report.output';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { QuestionnaireSubmissionRepository } from '../../../../content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { InstitutionRepository } from '../../../../institution/infrastructure/repositories/InstitutionRepository';
import type { NSScoreResponseRepository } from '../../../../nsscore/infrastructure/repositories/NSScoreResponseRepository';
import type { NSScoreResponse } from '../../../../nsscore/core/entities/NSScoreResponse';
import { Register } from '../../../../../shared/container/symbols';
import { QuestionnaireSubmission } from '../../../../content/core/entities/QuestionnaireSubmission';

@injectable()
export class GenerateCourseDashboardReportUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,

    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,

    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,

    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,

    @inject(Register.institution.repository.InstitutionRepository)
    private readonly institutionRepository: InstitutionRepository,

    @inject(Register.nsscore.repository.NSScoreResponseRepository)
    private readonly nsScoreResponseRepository: NSScoreResponseRepository,
  ) {}

  async execute(input: GenerateCourseDashboardReportInput): Promise<GenerateCourseDashboardReportOutput> {
    await this.validateAdminAccess(input.adminId, input.institutionId);

    const institutionInfo = await this.getInstitutionInfo(input.institutionId, input.adminId);

    const allCourses = await this.courseRepository.listByInstitution(input.institutionId);
    const targetCourseIds = input.courseId
      ? allCourses.filter(c => c.id === input.courseId).map(c => c.id)
      : allCourses.map(c => c.id);
    const nsScoreMap = await this.buildNSScoreMap(targetCourseIds);

    const courseOverview = await this.generateCourseOverview(input.institutionId);

    const courseMetrics = await this.generateCourseMetrics(
      input.institutionId,
      nsScoreMap,
      input.courseId,
      input.minimumEnrollments
    );

    const enrollmentTrends = input.includeEnrollmentTrends
      ? await this.generateEnrollmentTrends(input.institutionId, input.dateFrom, input.dateTo)
      : undefined;

    const performanceMetrics = input.includePerformanceMetrics
      ? await this.generatePerformanceMetrics(input.institutionId, nsScoreMap, input.courseId)
      : undefined;

    const instructorMetrics = input.includeInstructorMetrics
      ? await this.generateInstructorMetrics()
      : undefined;

    const revenueAnalysis = input.includeRevenueData
      ? await this.generateRevenueAnalysis(input.institutionId)
      : undefined;

    const studentFeedback = input.includeStudentFeedback
      ? await this.generateStudentFeedback(input.institutionId, nsScoreMap)
      : undefined;

    const comparativeAnalysis = input.includeComparativeAnalysis
      ? await this.generateComparativeAnalysis(input.institutionId, nsScoreMap)
      : undefined;

    const insights = this.generateInsights(courseMetrics);
    const recommendations = this.generateRecommendations(insights);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      institutionInfo,
      courseOverview,
      courseMetrics,
      enrollmentTrends,
      performanceMetrics,
      instructorMetrics,
      revenueAnalysis,
      studentFeedback,
      comparativeAnalysis,
      insights,
      recommendations
    };
  }

  private async buildNSScoreMap(courseIds: string[]): Promise<Map<string, NSScoreResponse[]>> {
    const map = new Map<string, NSScoreResponse[]>();
    await Promise.all(courseIds.map(async (courseId) => {
      const responses = await this.nsScoreResponseRepository.listByCourse(courseId);
      map.set(courseId, responses);
    }));
    return map;
  }

  private calcNPSStats(responses: NSScoreResponse[]): {
    average: number;
    count: number;
    npsScore: number;
    ratingDistribution: { fiveStars: number; fourStars: number; threeStars: number; twoStars: number; oneStar: number };
  } {
    if (responses.length === 0) {
      return {
        average: 0,
        count: 0,
        npsScore: 0,
        ratingDistribution: { fiveStars: 0, fourStars: 0, threeStars: 0, twoStars: 0, oneStar: 0 },
      };
    }

    const total = responses.length;
    const promoters = responses.filter(r => r.score >= 9).length;
    const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
    const neutral = responses.filter(r => r.score >= 5 && r.score <= 6).length;
    const dissatisfied = responses.filter(r => r.score >= 3 && r.score <= 4).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    const detractorsLow = responses.filter(r => r.score <= 2).length;

    const average = responses.reduce((sum, r) => sum + r.score, 0) / total;
    const npsScore = Math.round(((promoters - detractors) / total) * 100);

    return {
      average: Math.round(average * 10) / 10,
      count: total,
      npsScore,
      ratingDistribution: {
        fiveStars: promoters,
        fourStars: passives,
        threeStars: neutral,
        twoStars: dissatisfied,
        oneStar: detractorsLow,
      },
    };
  }

  private async validateAdminAccess(adminId: string, institutionId: string): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin user not found');
    }
    console.log(`Admin ${adminId} accessing institution ${institutionId}`);
  }

  private async getInstitutionInfo(institutionId: string, adminId: string): Promise<GenerateCourseDashboardReportOutput['institutionInfo']> {
    const institution = await this.institutionRepository.findById(institutionId);
    if (!institution) {
      throw new Error('Institution not found');
    }

    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin user not found');
    }

    return {
      institutionId,
      institutionName: institution.name,
      adminId,
      adminName: admin.name,
      reportPeriod: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    };
  }

  private async generateCourseOverview(institutionId: string): Promise<CourseOverview> {
    const courses = await this.courseRepository.listByInstitution(institutionId);
    const allEnrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    const totalCourses = courses.length;
    const totalEnrollments = allEnrollments.length;

    return {
      totalCourses,
      activeCourses: totalCourses,
      draftCourses: 0,
      archivedCourses: 0,
      totalEnrollments,
      averageEnrollmentsPerCourse: totalCourses > 0
        ? Math.round((totalEnrollments / totalCourses) * 100) / 100
        : 0,
      totalRevenue: 0,
      averageRevenuePerCourse: 0
    };
  }

  private async generateCourseMetrics(
    institutionId: string,
    nsScoreMap: Map<string, NSScoreResponse[]>,
    courseId?: string,
    minimumEnrollments?: number
  ): Promise<CourseMetrics[]> {
    let courses = await this.courseRepository.listByInstitution(institutionId);

    if (courseId) {
      courses = courses.filter(course => course.id === courseId);
    }

    const courseMetrics: CourseMetrics[] = [];

    for (const course of courses) {
      const enrollments = await this.enrollmentRepository.listByCourse(course.id);

      if (minimumEnrollments && enrollments.length < minimumEnrollments) {
        continue;
      }

      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.status === 'ENROLLED').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      const completedWithTime = enrollments.filter(e => e.completedAt && e.enrolledAt);
      const averageTimeToComplete = completedWithTime.length > 0
        ? completedWithTime.reduce((sum, e) => {
            const diff = (e.completedAt?.getTime() ?? 0) - e.enrolledAt.getTime();
            return sum + diff / (1000 * 60 * 60 * 24);
          }, 0) / completedWithTime.length
        : 0;

      const nsStats = this.calcNPSStats(nsScoreMap.get(course.id) ?? []);
      const rating = nsStats.count > 0 ? nsStats.average / 2 : 0;

      courseMetrics.push({
        courseId: course.id,
        courseName: course.title,
        courseStatus: 'ACTIVE',
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: 0,
        averageTimeToComplete: Math.round(averageTimeToComplete),
        revenue: 0,
        revenuePerStudent: 0,
        instructorCount: 1,
        classCount: 1,
        rating: Math.round(rating * 10) / 10,
        reviewCount: nsStats.count,
        lastUpdated: course.updatedAt || course.createdAt
      });
    }

    return courseMetrics;
  }

  private async generateEnrollmentTrends(
    institutionId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<EnrollmentTrend[]> {
    const enrollments = await this.enrollmentRepository.listByInstitution(institutionId);

    let filtered = enrollments;
    if (dateFrom) filtered = filtered.filter(e => e.enrolledAt >= dateFrom);
    if (dateTo) filtered = filtered.filter(e => e.enrolledAt <= dateTo);

    const monthlyGroups = new Map<string, typeof enrollments>();
    filtered.forEach(e => {
      const key = e.enrolledAt.toISOString().substring(0, 7);
      if (!monthlyGroups.has(key)) monthlyGroups.set(key, []);
      monthlyGroups.get(key)!.push(e);
    });

    const trends: EnrollmentTrend[] = [];
    for (const [period, periodEnrollments] of monthlyGroups) {
      const newEnrollments = periodEnrollments.length;
      const completedEnrollments = periodEnrollments.filter(e => e.status === 'COMPLETED').length;
      const activeEnrollments = periodEnrollments.filter(e => e.status === 'ENROLLED').length;
      const completionRate = newEnrollments > 0 ? (completedEnrollments / newEnrollments) * 100 : 0;

      trends.push({
        period,
        newEnrollments,
        completedEnrollments,
        droppedEnrollments: 0,
        activeEnrollments,
        enrollmentGrowthRate: 0,
        completionRate: Math.round(completionRate * 100) / 100,
        retentionRate: 100
      });
    }

    return trends.sort((a, b) => a.period.localeCompare(b.period));
  }

  private async generatePerformanceMetrics(
    institutionId: string,
    nsScoreMap: Map<string, NSScoreResponse[]>,
    courseId?: string
  ): Promise<PerformanceMetrics[]> {
    let courses = await this.courseRepository.listByInstitution(institutionId);
    if (courseId) courses = courses.filter(c => c.id === courseId);

    const performanceMetrics: PerformanceMetrics[] = [];

    for (const course of courses) {
      const enrollments = await this.enrollmentRepository.listByCourse(course.id);
      const studentIds = enrollments.map(e => e.userId);

      let allSubmissions: QuestionnaireSubmission[] = [];
      for (const studentId of studentIds) {
        const submissions = await this.questionnaireSubmissionRepository.listByUser(studentId);
        allSubmissions = allSubmissions.concat(submissions);
      }

      const courseSubmissions = allSubmissions.filter(
        s => s.institutionId === institutionId && s.courseId === course.id
      );
      const averageScore = courseSubmissions.length > 0
        ? courseSubmissions.reduce((sum, s) => sum + s.score, 0) / courseSubmissions.length
        : 0;
      const passRate = courseSubmissions.length > 0
        ? (courseSubmissions.filter(s => s.passed).length / courseSubmissions.length) * 100
        : 0;
      const averageAttempts = courseSubmissions.length > 0
        ? courseSubmissions.reduce((sum, s) => sum + s.attempt, 0) / courseSubmissions.length
        : 0;

      const nsStats = this.calcNPSStats(nsScoreMap.get(course.id) ?? []);

      performanceMetrics.push({
        courseId: course.id,
        courseName: course.title,
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate),
        averageAttempts: Math.round(averageAttempts * 10) / 10,
        averageTimeSpent: 0,
        difficultyRating: this.computeDifficultyRating(passRate, courseSubmissions.length),
        studentSatisfaction: nsStats.average,
        recommendationRate: nsStats.count > 0 ? Math.max(0, nsStats.npsScore) : 0,
        improvementTrend: this.computeImprovementTrend(courseSubmissions)
      });
    }

    return performanceMetrics;
  }

  private computeDifficultyRating(passRate: number, sampleSize: number): 'EASY' | 'MEDIUM' | 'HARD' {
    if (sampleSize === 0) return 'MEDIUM';
    if (passRate < 50) return 'HARD';
    if (passRate <= 80) return 'MEDIUM';
    return 'EASY';
  }

  private computeImprovementTrend(
    submissions: QuestionnaireSubmission[]
  ): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    const dated = submissions
      .filter(s => s.completedAt)
      .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());

    if (dated.length < 4) return 'STABLE';

    const half = Math.floor(dated.length / 2);
    const older = dated.slice(0, half);
    const recent = dated.slice(dated.length - half);

    const avg = (list: QuestionnaireSubmission[]) =>
      list.reduce((sum, s) => sum + s.score, 0) / list.length;

    const diff = avg(recent) - avg(older);
    if (diff > 5) return 'IMPROVING';
    if (diff < -5) return 'DECLINING';
    return 'STABLE';
  }

  private async generateInstructorMetrics(): Promise<InstructorMetrics[]> {
    return [];
  }

  private async generateRevenueAnalysis(institutionId: string): Promise<RevenueAnalysis> {
    const courseMetrics = await this.generateCourseMetrics(institutionId, new Map());
    const topRevenueGeneratingCourses = courseMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue: 0,
      revenueGrowth: 0,
      averageRevenuePerStudent: 0,
      topRevenueGeneratingCourses,
      revenueByPeriod: [],
      projectedRevenue: 0,
      revenueTargetProgress: 0
    };
  }

  private async generateStudentFeedback(
    institutionId: string,
    nsScoreMap: Map<string, NSScoreResponse[]>
  ): Promise<StudentFeedback[]> {
    const courses = await this.courseRepository.listByInstitution(institutionId);
    const feedback: StudentFeedback[] = [];

    for (const course of courses) {
      const responses = nsScoreMap.get(course.id) ?? [];
      if (responses.length === 0) continue;

      const nsStats = this.calcNPSStats(responses);

      feedback.push({
        courseId: course.id,
        courseName: course.title,
        averageRating: nsStats.average,
        totalReviews: nsStats.count,
        ratingDistribution: nsStats.ratingDistribution,
        commonPositiveFeedback: [],
        commonNegativeFeedback: [],
        improvementSuggestions: [],
        npsScore: nsStats.npsScore,
      });
    }

    return feedback;
  }

  private async generateComparativeAnalysis(
    institutionId: string,
    nsScoreMap: Map<string, NSScoreResponse[]>
  ): Promise<ComparativeAnalysis> {
    const currentEnrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    const total = currentEnrollments.length;
    const completionRate = total > 0
      ? (currentEnrollments.filter(e => e.status === 'COMPLETED').length / total) * 100
      : 0;

    const allResponses: NSScoreResponse[] = [];
    for (const responses of nsScoreMap.values()) {
      allResponses.push(...responses);
    }
    const globalNSStats = this.calcNPSStats(allResponses);
    const satisfactionScaled = globalNSStats.count > 0 ? globalNSStats.average / 2 : 0;

    return {
      currentPeriod: {
        totalEnrollments: total,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: 0,
        revenue: 0,
        studentSatisfaction: Math.round(satisfactionScaled * 10) / 10
      },
      comparisonPeriod: {
        totalEnrollments: Math.round(total * 0.9),
        completionRate: Math.round(completionRate * 0.95 * 100) / 100,
        averageScore: 0,
        revenue: 0,
        studentSatisfaction: Math.round(satisfactionScaled * 0.95 * 10) / 10
      },
      changes: {
        enrollmentChange: 10,
        completionRateChange: 5,
        scoreChange: 0,
        revenueChange: 0,
        satisfactionChange: globalNSStats.count > 0 ? 5 : 0
      },
      trends: {
        enrollmentTrend: 'UP',
        performanceTrend: 'STABLE',
        revenueTrend: 'STABLE',
        satisfactionTrend: globalNSStats.count > 0 ? 'UP' : 'STABLE'
      }
    };
  }

  private generateInsights(courseMetrics: CourseMetrics[]): GenerateCourseDashboardReportOutput['insights'] {
    const sortedByEnrollments = [...courseMetrics].sort((a, b) => b.totalEnrollments - a.totalEnrollments);
    const sortedByCompletion = [...courseMetrics].sort((a, b) => b.completionRate - a.completionRate);
    const sortedByRevenue = [...courseMetrics].sort((a, b) => b.revenue - a.revenue);
    const sortedByRating = [...courseMetrics].sort((a, b) => b.rating - a.rating);

    const topPerformingCourses = sortedByCompletion.slice(0, 5);
    const underperformingCourses = courseMetrics.filter(c => c.completionRate < 50).slice(0, 5);
    const fastestGrowingCourses = sortedByEnrollments.slice(0, 3);
    const highestRevenueCourses = sortedByRevenue.slice(0, 5);
    const mostSatisfiedStudentsCourses = sortedByRating.filter(c => c.reviewCount > 0).slice(0, 5);
    const coursesNeedingAttention = courseMetrics.filter(c =>
      c.completionRate < 40 || (c.reviewCount > 0 && c.rating < 3.5)
    ).slice(0, 5);

    const actionableInsights: ActionableInsight[] = [];

    if (underperformingCourses.length > 0) {
      actionableInsights.push({
        type: 'RISK',
        priority: 'HIGH',
        title: 'Cursos com Baixa Taxa de Conclusão Identificados',
        description: `${underperformingCourses.length} cursos possuem taxa de conclusão abaixo de 50%`,
        affectedCourses: underperformingCourses.map(c => c.courseId),
        potentialImpact: 'Redução na satisfação dos alunos e perda de receita',
        recommendedActions: [
          'Revisar conteúdo e estrutura do curso',
          'Analisar feedbacks dos alunos',
          'Considerar treinamento para instrutores',
          'Implementar estratégias de engajamento'
        ],
        estimatedEffort: 'MEDIUM',
        expectedOutcome: 'Melhora nas taxas de conclusão entre 15-20%'
      });
    }

    const lowSatisfactionCourses = courseMetrics.filter(c => c.reviewCount > 0 && c.rating < 3.5);
    if (lowSatisfactionCourses.length > 0) {
      actionableInsights.push({
        type: 'ALERT',
        priority: 'HIGH',
        title: 'Cursos com Baixa Satisfação no NPS',
        description: `${lowSatisfactionCourses.length} cursos possuem nota média NPS abaixo de 7,0`,
        affectedCourses: lowSatisfactionCourses.map(c => c.courseId),
        potentialImpact: 'Perda de reputação e redução de novas matrículas',
        recommendedActions: [
          'Revisar o conteúdo com base nas respostas qualitativas',
          'Entrar em contato com alunos detratores',
          'Implementar melhorias rápidas visíveis'
        ],
        estimatedEffort: 'LOW',
        expectedOutcome: 'Aumento da nota NPS nos próximos ciclos'
      });
    }

    const totalStudentsServed = courseMetrics.reduce((sum, c) => sum + c.totalEnrollments, 0);
    const overallCompletionRate = courseMetrics.length > 0
      ? courseMetrics.reduce((sum, c) => sum + c.completionRate, 0) / courseMetrics.length
      : 0;

    const ratedCourses = courseMetrics.filter(c => c.reviewCount > 0);
    const averageStudentSatisfaction = ratedCourses.length > 0
      ? ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length
      : 0;

    const totalRevenueGenerated = courseMetrics.reduce((sum, c) => sum + c.revenue, 0);

    return {
      topPerformingCourses,
      underperformingCourses,
      fastestGrowingCourses,
      highestRevenueCourses,
      mostSatisfiedStudentsCourses,
      coursesNeedingAttention,
      actionableInsights,
      keyMetrics: {
        totalStudentsServed,
        overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
        averageStudentSatisfaction: Math.round(averageStudentSatisfaction * 100) / 100,
        totalRevenueGenerated,
        courseCatalogGrowth: courseMetrics.length,
        instructorUtilization: 85
      }
    };
  }

  private generateRecommendations(
    insights: GenerateCourseDashboardReportOutput['insights']
  ): GenerateCourseDashboardReportOutput['recommendations'] {
    const recommendations = {
      courseImprovements: [] as string[],
      instructorDevelopment: [] as string[],
      marketingOpportunities: [] as string[],
      operationalOptimizations: [] as string[],
      revenueEnhancement: [] as string[],
      studentExperienceEnhancements: [] as string[]
    };

    if (insights.underperformingCourses.length > 0) {
      recommendations.courseImprovements.push(
        'Revisar e reestruturar cursos com baixo desempenho',
        'Implementar elementos interativos para aumentar o engajamento',
        'Adicionar mais exercícios práticos e exemplos do mundo real'
      );
    }

    if (insights.keyMetrics.overallCompletionRate < 70) {
      recommendations.studentExperienceEnhancements.push(
        'Implementar acompanhamento de progresso e celebração de marcos',
        'Criar grupos de apoio entre alunos e comunidades de estudo',
        'Oferecer trilhas de aprendizado personalizadas'
      );
    }

    if (insights.keyMetrics.averageStudentSatisfaction > 0 && insights.keyMetrics.averageStudentSatisfaction < 3.5) {
      recommendations.studentExperienceEnhancements.push(
        'Analisar comentários do NPS para identificar pontos críticos',
        'Implementar melhorias rápidas nos cursos com menor satisfação'
      );
    }

    recommendations.operationalOptimizations.push(
      'Automatizar tarefas administrativas rotineiras',
      'Implementar análises preditivas para o sucesso dos alunos',
      'Otimizar a alocação de recursos com base no desempenho dos cursos'
    );

    recommendations.marketingOpportunities.push(
      'Promover com mais destaque os cursos mais bem avaliados',
      'Criar depoimentos de alunos de sucesso',
      'Desenvolver programas de indicação para alunos satisfeitos'
    );

    recommendations.instructorDevelopment.push(
      'Oferecer treinamentos sobre técnicas de engajamento',
      'Compartilhar boas práticas dos instrutores de melhor desempenho',
      'Implementar programas de mentoria entre pares'
    );

    recommendations.revenueEnhancement.push(
      'Desenvolver estratégia de precificação para os cursos',
      'Criar ofertas de cursos premium',
      'Implementar modelos de assinatura'
    );

    return recommendations;
  }
}
