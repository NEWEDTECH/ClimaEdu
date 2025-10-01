import { inject, injectable } from 'inversify';
import { GenerateStudentAssessmentPerformanceReportInput } from './generate-student-assessment-performance-report.input';
import { GenerateStudentAssessmentPerformanceReportOutput, AssessmentPerformanceData, AssessmentSummaryStats, PerformanceTrend } from './generate-student-assessment-performance-report.output';
import type { QuestionnaireSubmissionRepository } from '../../../../content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { QuestionnaireRepository } from '../../../../content/infrastructure/repositories/QuestionnaireRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { LessonRepository } from '../../../../content/infrastructure/repositories/LessonRepository';
import type { ModuleRepository } from '../../../../content/infrastructure/repositories/ModuleRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { QuestionnaireSubmission } from '../../../../content/core/entities/QuestionnaireSubmission';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating student assessment performance report
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateStudentAssessmentPerformanceReportUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,
    
    @inject(Register.content.repository.QuestionnaireRepository)
    private readonly questionnaireRepository: QuestionnaireRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.content.repository.LessonRepository)
    private readonly lessonRepository: LessonRepository,
    
    @inject(Register.content.repository.ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GenerateStudentAssessmentPerformanceReportInput): Promise<GenerateStudentAssessmentPerformanceReportOutput> {
    // Validate user exists and get user info
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all questionnaire submissions for the user
    let submissions = await this.questionnaireSubmissionRepository.listByUser(input.userId);
    
    // Filter by institution (assuming submissions have institutionId property)
    submissions = submissions.filter(submission => submission.institutionId === input.institutionId);

    // Apply filters
    submissions = this.applyFilters(submissions, input);

    // Build assessment performance data
    const assessments: AssessmentPerformanceData[] = [];
    
    for (const submission of submissions) {
      const assessmentData = await this.buildAssessmentPerformanceData(submission);
      assessments.push(assessmentData);
    }

    // Sort by completion date (most recent first)
    assessments.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    // Calculate summary statistics
    const summary = this.calculateSummaryStats(assessments);

    // Generate performance trends
    const trends = this.generatePerformanceTrends(assessments);

    // Generate insights and recommendations
    const insights = this.generateInsights(assessments);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'StudentAssessmentPerformanceReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['QuestionnaireSubmission', 'Questionnaire', 'Course', 'Lesson', 'Module'],
        totalRecords: assessments.length
      },
      studentId: input.userId,
      studentName: user.name,
      summary,
      assessments,
      trends,
      insights,
      filtersApplied: {
        courseId: input.courseId,
        questionnaireId: input.questionnaireId,
        dateRange: input.dateFrom && input.dateTo ? {
          from: input.dateFrom,
          to: input.dateTo
        } : undefined,
        includePassedOnly: input.includePassedOnly,
        includeFailedOnly: input.includeFailedOnly
      }
    };
  }

  private applyFilters(
    submissions: QuestionnaireSubmission[],
    input: GenerateStudentAssessmentPerformanceReportInput
  ): QuestionnaireSubmission[] {
    let filtered = submissions;

    // Filter by questionnaire
    if (input.questionnaireId) {
      filtered = filtered.filter(s => s.questionnaireId === input.questionnaireId);
    }

    // Filter by pass/fail status
    if (input.includePassedOnly) {
      filtered = filtered.filter(s => s.passed);
    } else if (input.includeFailedOnly) {
      filtered = filtered.filter(s => !s.passed);
    }

    // Filter by date range
    if (input.dateFrom) {
      filtered = filtered.filter(s => s.completedAt >= (input.dateFrom ?? new Date(0)));
    }
    if (input.dateTo) {
      filtered = filtered.filter(s => s.completedAt <= (input.dateTo ?? new Date()));
    }

    return filtered;
  }

  private async buildAssessmentPerformanceData(
    submission: {
      id: string;
      questionnaireId: string;
      score: number;
      passed: boolean;
      attempt: number;
      startedAt: Date;
      completedAt: Date;
      questions: { isCorrect: boolean }[];
    }
  ): Promise<AssessmentPerformanceData> {
    // Get questionnaire details
    const questionnaire = await this.questionnaireRepository.findById(submission.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire not found: ${submission.questionnaireId}`);
    }

    // Get lesson details
    const lesson = await this.lessonRepository.findById(questionnaire.lessonId);
    if (!lesson) {
      throw new Error(`Lesson not found: ${questionnaire.lessonId}`);
    }

    // Get module details
    const lessonModule = await this.moduleRepository.findById(lesson.moduleId);
    if (!lessonModule) {
      throw new Error(`Module not found: ${lesson.moduleId}`);
    }

    // Get course details
    const course = await this.courseRepository.findById(lessonModule.courseId);
    if (!course) {
      throw new Error(`Course not found: ${lessonModule.courseId}`);
    }

    // Calculate timing
    const timeSpent = Math.round((submission.completedAt.getTime() - submission.startedAt.getTime()) / (1000 * 60));

    // Calculate question statistics
    const totalQuestions = submission.questions.length;
    const correctAnswers = submission.questions.filter(q => q.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;

    // Calculate retry information
    const attemptsRemaining = Math.max(0, questionnaire.maxAttempts - submission.attempt);
    const canRetry = attemptsRemaining > 0 && !submission.passed;

    return {
      submissionId: submission.id,
      questionnaireId: questionnaire.id,
      questionnaireTitle: questionnaire.title,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      moduleTitle: lessonModule.title,
      score: submission.score,
      passed: submission.passed,
      attemptNumber: submission.attempt,
      maxAttempts: questionnaire.maxAttempts,
      passingScore: questionnaire.passingScore,
      startedAt: submission.startedAt,
      completedAt: submission.completedAt,
      timeSpent,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      canRetry,
      attemptsRemaining
    };
  }

  private calculateSummaryStats(assessments: AssessmentPerformanceData[]): AssessmentSummaryStats {
    if (assessments.length === 0) {
      return {
        totalSubmissions: 0,
        passedSubmissions: 0,
        failedSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTimeSpent: 0,
        totalTimeSpent: 0,
        passRate: 0,
        averageAttempts: 0
      };
    }

    const totalSubmissions = assessments.length;
    const passedSubmissions = assessments.filter(a => a.passed).length;
    const failedSubmissions = totalSubmissions - passedSubmissions;
    
    const scores = assessments.map(a => a.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    const totalTimeSpent = assessments.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTimeSpent = totalTimeSpent / totalSubmissions;
    
    const passRate = (passedSubmissions / totalSubmissions) * 100;
    
    const attempts = assessments.map(a => a.attemptNumber);
    const averageAttempts = attempts.reduce((sum, attempt) => sum + attempt, 0) / attempts.length;

    // Find most difficult and best performance questionnaires
    const questionnaireStats = this.calculateQuestionnaireStats(assessments);
    const mostDifficultQuestionnaire = questionnaireStats.sort((a, b) => a.averageScore - b.averageScore)[0];
    const bestPerformanceQuestionnaire = questionnaireStats.sort((a, b) => b.averageScore - a.averageScore)[0];

    return {
      totalSubmissions,
      passedSubmissions,
      failedSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      averageTimeSpent: Math.round(averageTimeSpent * 100) / 100,
      totalTimeSpent,
      passRate: Math.round(passRate * 100) / 100,
      averageAttempts: Math.round(averageAttempts * 100) / 100,
      mostDifficultQuestionnaire,
      bestPerformanceQuestionnaire
    };
  }

  private calculateQuestionnaireStats(assessments: AssessmentPerformanceData[]): Array<{
    questionnaireId: string;
    title: string;
    averageScore: number;
    passRate: number;
  }> {
    const questionnaireMap = new Map<string, AssessmentPerformanceData[]>();
    
    assessments.forEach(assessment => {
      if (!questionnaireMap.has(assessment.questionnaireId)) {
        questionnaireMap.set(assessment.questionnaireId, []);
      }
      questionnaireMap.get(assessment.questionnaireId)!.push(assessment);
    });

    return Array.from(questionnaireMap.entries()).map(([questionnaireId, assessmentList]) => {
      const averageScore = assessmentList.reduce((sum, a) => sum + a.score, 0) / assessmentList.length;
      const passedCount = assessmentList.filter(a => a.passed).length;
      const passRate = (passedCount / assessmentList.length) * 100;

      return {
        questionnaireId,
        title: assessmentList[0].questionnaireTitle,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100
      };
    });
  }

  private generatePerformanceTrends(assessments: AssessmentPerformanceData[]): PerformanceTrend[] {
    // Group assessments by month
    const monthlyData = new Map<string, AssessmentPerformanceData[]>();
    
    assessments.forEach(assessment => {
      const monthKey = assessment.completedAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, []);
      }
      monthlyData.get(monthKey)!.push(assessment);
    });

    return Array.from(monthlyData.entries())
      .map(([period, periodAssessments]) => {
        const averageScore = periodAssessments.reduce((sum, a) => sum + a.score, 0) / periodAssessments.length;
        const passedCount = periodAssessments.filter(a => a.passed).length;
        const passRate = (passedCount / periodAssessments.length) * 100;

        return {
          period,
          averageScore: Math.round(averageScore * 100) / 100,
          submissionsCount: periodAssessments.length,
          passRate: Math.round(passRate * 100) / 100
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private generateInsights(assessments: AssessmentPerformanceData[]): {
    improvementAreas: string[];
    strengths: string[];
    recommendations: string[];
    nextRetryOpportunities: Array<{
      questionnaireId: string;
      title: string;
      lastAttemptScore: number;
      attemptsRemaining: number;
    }>;
  } {
    const improvementAreas: string[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];

    if (assessments.length === 0) {
      return { improvementAreas, strengths, recommendations, nextRetryOpportunities: [] };
    }

    const summary = this.calculateSummaryStats(assessments);

    // Identify improvement areas
    if (summary.passRate < 70) {
      improvementAreas.push('Taxa de aprovação baixa - considere revisar o material antes das avaliações');
    }
    if (summary.averageScore < 75) {
      improvementAreas.push('Pontuação média abaixo do esperado - foque em áreas de maior dificuldade');
    }
    if (summary.averageAttempts > 2) {
      improvementAreas.push('Múltiplas tentativas necessárias - melhore a preparação inicial');
    }

    // Identify strengths
    if (summary.passRate >= 90) {
      strengths.push('Excelente taxa de aprovação - demonstra boa compreensão do conteúdo');
    }
    if (summary.averageScore >= 85) {
      strengths.push('Pontuação média alta - mostra domínio consistente dos tópicos');
    }
    if (summary.averageTimeSpent < 15) {
      strengths.push('Tempo eficiente nas avaliações - boa preparação prévia');
    }

    // Generate recommendations
    if (summary.averageScore < 80) {
      recommendations.push('Dedique mais tempo ao estudo antes de realizar as avaliações');
    }
    if (summary.averageTimeSpent > 30) {
      recommendations.push('Considere revisar o material mais vezes para melhorar a velocidade');
    }
    
    const failedAssessments = assessments.filter(a => !a.passed);
    if (failedAssessments.length > 0) {
      recommendations.push('Revise os tópicos das avaliações não aprovadas antes de tentar novamente');
    }

    // Find retry opportunities
    const nextRetryOpportunities = assessments
      .filter(a => a.canRetry)
      .map(a => ({
        questionnaireId: a.questionnaireId,
        title: a.questionnaireTitle,
        lastAttemptScore: a.score,
        attemptsRemaining: a.attemptsRemaining
      }))
      .slice(0, 5); // Limit to 5 opportunities

    return {
      improvementAreas,
      strengths,
      recommendations,
      nextRetryOpportunities
    };
  }
}
