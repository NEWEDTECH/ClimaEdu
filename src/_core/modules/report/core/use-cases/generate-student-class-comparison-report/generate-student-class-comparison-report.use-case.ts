import { inject, injectable } from 'inversify';
import { GenerateStudentClassComparisonReportInput } from './generate-student-class-comparison-report.input';
import { 
  GenerateStudentClassComparisonReportOutput, 
  StudentComparisonData, 
  StudentRanking, 
  StudentClassStatistics, 
  PerformanceComparison, 
  PeerAnalysis, 
  GamificationData, 
  MotivationalInsights 
} from './generate-student-class-comparison-report.output';
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { QuestionnaireSubmissionRepository } from '../../../../content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating student class comparison report
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateStudentClassComparisonReportUseCase {
  constructor(
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,
    
    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository
  ) {}

  async execute(input: GenerateStudentClassComparisonReportInput): Promise<GenerateStudentClassComparisonReportOutput> {
    // Validate user exists and get user info
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get analysis period
    const analysisPeriod = this.getAnalysisPeriod(input);

    // Get all students in the same institution/class for comparison
    const classStudents = await this.getClassStudents(input);

    // Build student comparison data for all students
    const allStudentsData = await this.buildStudentComparisonData(classStudents, input, analysisPeriod);

    // Calculate class statistics
    const classStatistics = this.calculateClassStatistics(allStudentsData);

    // Find current student data
    const currentStudentData = allStudentsData.find(s => s.studentId === input.userId);
    if (!currentStudentData) {
      throw new Error('Current student data not found');
    }

    // Calculate student ranking
    const ranking = this.calculateStudentRanking(currentStudentData, allStudentsData);

    // Generate performance comparisons
    const performanceComparisons = this.generatePerformanceComparisons(currentStudentData, classStatistics);

    // Generate peer analysis if requested
    const peerAnalysis = input.includeDetailedAnalysis 
      ? this.generatePeerAnalysis(currentStudentData, allStudentsData)
      : undefined;

    // Generate gamification data
    const gamification = this.generateGamificationData(currentStudentData, ranking);

    // Generate motivational insights
    const insights = this.generateMotivationalInsights(currentStudentData, ranking, performanceComparisons);

    // Generate historical trends (simplified)
    const trends = this.generateTrends(currentStudentData, classStatistics);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'StudentClassComparisonReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['LessonProgress', 'Enrollment', 'User', 'QuestionnaireSubmission'],
        totalRecords: allStudentsData.length
      },
      studentId: input.userId,
      studentName: user.name,
      classId: input.classId,
      className: input.classId ? `Turma ${input.classId}` : undefined,
      courseId: input.courseId,
      courseName: input.courseId ? `Curso ${input.courseId}` : undefined,
      analysisPeriod,
      ranking,
      classStatistics,
      performanceComparisons,
      peerAnalysis,
      gamification,
      insights,
      trends,
      filtersApplied: {
        courseId: input.courseId,
        classId: input.classId,
        dateRange: input.dateFrom && input.dateTo ? {
          from: input.dateFrom,
          to: input.dateTo
        } : undefined,
        includeActiveOnly: input.includeActiveOnly ?? true,
        minimumActivities: input.minimumActivities ?? 5,
        comparisonType: input.comparisonType || 'overall',
        includeDetailedAnalysis: input.includeDetailedAnalysis ?? false
      }
    };
  }

  private getAnalysisPeriod(input: GenerateStudentClassComparisonReportInput): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  } {
    const endDate = input.dateTo || new Date();
    const startDate = input.dateFrom || new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return { startDate, endDate, totalDays };
  }

  private async getClassStudents(input: GenerateStudentClassComparisonReportInput): Promise<string[]> {
    // Get all enrollments for the institution
    const enrollments = await this.enrollmentRepository.listByInstitution(input.institutionId);
    
    // Filter by course if specified
    let filteredEnrollments = enrollments;
    if (input.courseId) {
      filteredEnrollments = enrollments.filter(e => e.courseId === input.courseId);
    }

    // Filter by active students if requested
    if (input.includeActiveOnly) {
      filteredEnrollments = filteredEnrollments.filter(e => e.status.toString() === 'ENROLLED');
    }

    return filteredEnrollments.map(e => e.userId);
  }

  private async buildStudentComparisonData(
    studentIds: string[], 
    input: GenerateStudentClassComparisonReportInput,
    analysisPeriod: { startDate: Date; endDate: Date }
  ): Promise<StudentComparisonData[]> {
    const studentsData: StudentComparisonData[] = [];

    for (const studentId of studentIds) {
      try {
        const user = await this.userRepository.findById(studentId);
        if (!user) continue;

        // Get lesson progresses for this student
        const lessonProgresses = await this.lessonProgressRepository.findByUserAndInstitution(
          studentId, 
          input.institutionId
        );

        // Filter by date range
        const filteredProgresses = lessonProgresses.filter(progress => 
          progress.lastAccessedAt >= analysisPeriod.startDate && 
          progress.lastAccessedAt <= analysisPeriod.endDate
        );

        // Skip students with insufficient activity
        if (filteredProgresses.length < (input.minimumActivities ?? 5)) {
          continue;
        }

        // Calculate metrics
        const studyTimeMinutes = filteredProgresses.reduce((sum, p) => sum + p.getTotalTimeSpent(), 0);
        const completedLessons = filteredProgresses.filter(p => p.status === 'COMPLETED').length;
        const progressPercentage = filteredProgresses.length > 0 
          ? (completedLessons / filteredProgresses.length) * 100 
          : 0;

        // Get assessment scores (simplified)
        const assessmentScores = await this.getStudentAssessmentScores(studentId, input.institutionId);
        const averageAssessmentScore = assessmentScores.length > 0
          ? assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length
          : 0;

        // Calculate overall score (weighted combination)
        const overallScore = Math.round(
          (progressPercentage * 0.4) + 
          (averageAssessmentScore * 0.4) + 
          (Math.min(100, studyTimeMinutes / 10) * 0.2) // Study time factor
        );

        const lastActivityDate = filteredProgresses.length > 0
          ? new Date(Math.max(...filteredProgresses.map(p => p.lastAccessedAt.getTime())))
          : new Date();

        studentsData.push({
          studentId,
          studentName: user.name,
          overallScore,
          progressPercentage: Math.round(progressPercentage),
          studyTimeMinutes,
          completedLessons,
          averageAssessmentScore: Math.round(averageAssessmentScore),
          lastActivityDate,
          isCurrentUser: studentId === input.userId
        });

      } catch (error) {
        console.log(error)
        // Skip students with errors
        continue;
      }
    }

    return studentsData.sort((a, b) => b.overallScore - a.overallScore);
  }

  private async getStudentAssessmentScores(studentId: string, institutionId: string): Promise<number[]> {
    const submissions = await this.questionnaireSubmissionRepository.listByUser(studentId);
    const institutionSubmissions = submissions.filter(s => s.institutionId === institutionId);
    return institutionSubmissions.map(s => s.score);
  }

  private calculateClassStatistics(studentsData: StudentComparisonData[]): StudentClassStatistics {
    if (studentsData.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0,
        averageScore: 0,
        averageStudyTime: 0,
        medianProgress: 0,
        medianScore: 0,
        standardDeviation: { progress: 0, score: 0, studyTime: 0 }
      };
    }

    const totalStudents = studentsData.length;
    const activeStudents = studentsData.filter(s => 
      s.lastActivityDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Calculate averages
    const averageProgress = studentsData.reduce((sum, s) => sum + s.progressPercentage, 0) / totalStudents;
    const averageScore = studentsData.reduce((sum, s) => sum + s.overallScore, 0) / totalStudents;
    const averageStudyTime = studentsData.reduce((sum, s) => sum + s.studyTimeMinutes, 0) / totalStudents;

    // Calculate medians
    const sortedByProgress = [...studentsData].sort((a, b) => a.progressPercentage - b.progressPercentage);
    const sortedByScore = [...studentsData].sort((a, b) => a.overallScore - b.overallScore);
    
    const medianIndex = Math.floor(totalStudents / 2);
    const medianProgress = totalStudents % 2 === 0
      ? (sortedByProgress[medianIndex - 1].progressPercentage + sortedByProgress[medianIndex].progressPercentage) / 2
      : sortedByProgress[medianIndex].progressPercentage;
    
    const medianScore = totalStudents % 2 === 0
      ? (sortedByScore[medianIndex - 1].overallScore + sortedByScore[medianIndex].overallScore) / 2
      : sortedByScore[medianIndex].overallScore;

    // Calculate standard deviations (simplified)
    const progressVariance = studentsData.reduce((sum, s) => 
      sum + Math.pow(s.progressPercentage - averageProgress, 2), 0) / totalStudents;
    const scoreVariance = studentsData.reduce((sum, s) => 
      sum + Math.pow(s.overallScore - averageScore, 2), 0) / totalStudents;
    const studyTimeVariance = studentsData.reduce((sum, s) => 
      sum + Math.pow(s.studyTimeMinutes - averageStudyTime, 2), 0) / totalStudents;

    return {
      totalStudents,
      activeStudents,
      averageProgress: Math.round(averageProgress),
      averageScore: Math.round(averageScore),
      averageStudyTime: Math.round(averageStudyTime),
      medianProgress: Math.round(medianProgress),
      medianScore: Math.round(medianScore),
      standardDeviation: {
        progress: Math.round(Math.sqrt(progressVariance)),
        score: Math.round(Math.sqrt(scoreVariance)),
        studyTime: Math.round(Math.sqrt(studyTimeVariance))
      }
    };
  }

  private calculateStudentRanking(currentStudent: StudentComparisonData, allStudents: StudentComparisonData[]): StudentRanking {
    const sortedStudents = [...allStudents].sort((a, b) => b.overallScore - a.overallScore);
    const currentRank = sortedStudents.findIndex(s => s.studentId === currentStudent.studentId) + 1;
    const totalStudents = allStudents.length;
    const percentileRank = Math.round(((totalStudents - currentRank + 1) / totalStudents) * 100);

    let rankingCategory: 'top_10' | 'top_25' | 'top_50' | 'bottom_50' | 'bottom_25';
    const percentile = (currentRank / totalStudents) * 100;
    
    if (percentile <= 10) rankingCategory = 'top_10';
    else if (percentile <= 25) rankingCategory = 'top_25';
    else if (percentile <= 50) rankingCategory = 'top_50';
    else if (percentile <= 75) rankingCategory = 'bottom_50';
    else rankingCategory = 'bottom_25';

    const nextRankStudent = currentRank > 1 ? sortedStudents[currentRank - 2] : undefined;
    const pointsToNextRank = nextRankStudent 
      ? nextRankStudent.overallScore - currentStudent.overallScore 
      : 0;

    return {
      currentRank,
      totalStudents,
      percentileRank,
      rankingCategory,
      pointsToNextRank,
      nextRankStudent: nextRankStudent ? {
        studentName: nextRankStudent.studentName,
        score: nextRankStudent.overallScore
      } : undefined
    };
  }

  private generatePerformanceComparisons(student: StudentComparisonData, classStats: StudentClassStatistics): PerformanceComparison[] {
    const comparisons: PerformanceComparison[] = [];

    // Progress comparison
    comparisons.push({
      metric: 'progress',
      studentValue: student.progressPercentage,
      classAverage: classStats.averageProgress,
      classMedian: classStats.medianProgress,
      percentilePosition: this.calculatePercentile(student.progressPercentage, classStats.averageProgress),
      performanceLevel: this.getPerformanceLevel(student.progressPercentage, classStats.averageProgress),
      comparisonText: this.generateComparisonText('progresso', student.progressPercentage, classStats.averageProgress)
    });

    // Score comparison
    comparisons.push({
      metric: 'score',
      studentValue: student.overallScore,
      classAverage: classStats.averageScore,
      classMedian: classStats.medianScore,
      percentilePosition: this.calculatePercentile(student.overallScore, classStats.averageScore),
      performanceLevel: this.getPerformanceLevel(student.overallScore, classStats.averageScore),
      comparisonText: this.generateComparisonText('pontuação geral', student.overallScore, classStats.averageScore)
    });

    // Study time comparison
    comparisons.push({
      metric: 'study_time',
      studentValue: student.studyTimeMinutes,
      classAverage: classStats.averageStudyTime,
      classMedian: classStats.averageStudyTime, // Simplified
      percentilePosition: this.calculatePercentile(student.studyTimeMinutes, classStats.averageStudyTime),
      performanceLevel: this.getPerformanceLevel(student.studyTimeMinutes, classStats.averageStudyTime),
      comparisonText: this.generateComparisonText('tempo de estudo', student.studyTimeMinutes, classStats.averageStudyTime, 'minutos')
    });

    return comparisons;
  }

  private calculatePercentile(studentValue: number, classAverage: number): number {
    if (classAverage === 0) return 50;
    const ratio = studentValue / classAverage;
    return Math.min(100, Math.max(0, Math.round(ratio * 50)));
  }

  private getPerformanceLevel(studentValue: number, classAverage: number): 'excellent' | 'above_average' | 'average' | 'below_average' | 'needs_improvement' {
    if (classAverage === 0) return 'average';
    
    const ratio = studentValue / classAverage;
    if (ratio >= 1.3) return 'excellent';
    if (ratio >= 1.1) return 'above_average';
    if (ratio >= 0.9) return 'average';
    if (ratio >= 0.7) return 'below_average';
    return 'needs_improvement';
  }

  private generateComparisonText(metric: string, studentValue: number, classAverage: number, unit: string = '%'): string {
    const difference = studentValue - classAverage;
    const percentDiff = classAverage > 0 ? Math.abs(difference / classAverage) * 100 : 0;
    
    if (Math.abs(difference) < classAverage * 0.1) {
      return `Seu ${metric} está na média da turma (${studentValue}${unit} vs ${Math.round(classAverage)}${unit})`;
    } else if (difference > 0) {
      return `Seu ${metric} está ${Math.round(percentDiff)}% acima da média da turma (${studentValue}${unit} vs ${Math.round(classAverage)}${unit})`;
    } else {
      return `Seu ${metric} está ${Math.round(percentDiff)}% abaixo da média da turma (${studentValue}${unit} vs ${Math.round(classAverage)}${unit})`;
    }
  }

  private generatePeerAnalysis(currentStudent: StudentComparisonData, allStudents: StudentComparisonData[]): PeerAnalysis {
    const otherStudents = allStudents.filter(s => s.studentId !== currentStudent.studentId);
    
    // Find similar performers (within 10% of current student's score)
    const similarPerformers = otherStudents.filter(s => 
      Math.abs(s.overallScore - currentStudent.overallScore) <= currentStudent.overallScore * 0.1
    ).slice(0, 5);

    // Get top performers
    const topPerformers = otherStudents
      .filter(s => s.overallScore > currentStudent.overallScore)
      .slice(0, 3);

    // Generate improvement opportunities
    const improvementOpportunities = [];
    
    if (currentStudent.progressPercentage < 80) {
      const betterProgressStudents = otherStudents.filter(s => s.progressPercentage >= 80).length;
      improvementOpportunities.push({
        metric: 'Progresso do Curso',
        currentValue: currentStudent.progressPercentage,
        targetValue: 80,
        studentsAtTarget: betterProgressStudents,
        actionSuggestion: 'Complete mais aulas para melhorar seu progresso'
      });
    }

    if (currentStudent.studyTimeMinutes < 300) { // Less than 5 hours
      const moreActiveStudents = otherStudents.filter(s => s.studyTimeMinutes >= 300).length;
      improvementOpportunities.push({
        metric: 'Tempo de Estudo',
        currentValue: currentStudent.studyTimeMinutes,
        targetValue: 300,
        studentsAtTarget: moreActiveStudents,
        actionSuggestion: 'Aumente seu tempo de estudo para pelo menos 5 horas por semana'
      });
    }

    return {
      similarPerformers,
      topPerformers,
      improvementOpportunities
    };
  }

  private generateGamificationData(student: StudentComparisonData, ranking: StudentRanking): GamificationData {
    const experiencePoints = student.overallScore * 10;
    const currentLevel = Math.floor(experiencePoints / 1000) + 1;
    const pointsToNextLevel = (currentLevel * 1000) - experiencePoints;

    return {
      currentLevel,
      experiencePoints,
      pointsToNextLevel,
      achievements: [
        {
          id: 'first_lesson',
          name: 'Primeira Aula',
          description: 'Complete sua primeira aula',
          earnedAt: student.completedLessons > 0 ? new Date() : undefined,
          progress: student.completedLessons > 0 ? 100 : 0
        },
        {
          id: 'top_50',
          name: 'Top 50%',
          description: 'Entre no top 50% da turma',
          earnedAt: ranking.percentileRank >= 50 ? new Date() : undefined,
          progress: Math.min(100, ranking.percentileRank * 2)
        }
      ],
      leaderboardPosition: {
        daily: ranking.currentRank,
        weekly: ranking.currentRank,
        monthly: ranking.currentRank,
        allTime: ranking.currentRank
      },
      streaks: [
        {
          current: Math.min(7, Math.floor(student.studyTimeMinutes / 60)),
          longest: Math.min(14, Math.floor(student.studyTimeMinutes / 30)),
          type: 'study_days'
        }
      ]
    };
  }

  private generateMotivationalInsights(
    student: StudentComparisonData, 
    ranking: StudentRanking, 
    comparisons: PerformanceComparison[]
  ): MotivationalInsights {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const shortTermGoals: string[] = [];
    const longTermGoals: string[] = [];

    // Analyze strengths
    comparisons.forEach(comp => {
      if (comp.performanceLevel === 'excellent' || comp.performanceLevel === 'above_average') {
        strengths.push(`Excelente ${comp.metric === 'progress' ? 'progresso' : comp.metric === 'score' ? 'desempenho' : 'dedicação'}`);
      } else if (comp.performanceLevel === 'below_average' || comp.performanceLevel === 'needs_improvement') {
        improvementAreas.push(`${comp.metric === 'progress' ? 'Progresso' : comp.metric === 'score' ? 'Desempenho' : 'Tempo de estudo'} precisa de atenção`);
      }
    });

    // Generate goals
    if (ranking.currentRank > 1) {
      shortTermGoals.push(`Subir ${Math.min(5, ranking.currentRank - 1)} posições no ranking`);
    }
    
    if (student.progressPercentage < 100) {
      shortTermGoals.push('Completar mais 3 aulas esta semana');
    }

    longTermGoals.push('Entrar no top 25% da turma');
    longTermGoals.push('Manter consistência de estudo por 30 dias');

    let motivationalMessage = '';
    if (ranking.rankingCategory === 'top_10') {
      motivationalMessage = '🏆 Parabéns! Você está entre os melhores da turma!';
    } else if (ranking.rankingCategory === 'top_25') {
      motivationalMessage = '🌟 Ótimo trabalho! Você está no primeiro quartil da turma!';
    } else if (ranking.rankingCategory === 'top_50') {
      motivationalMessage = '👍 Bom progresso! Você está acima da média da turma!';
    } else {
      motivationalMessage = '💪 Continue se esforçando! Há muito potencial para crescer!';
    }

    return {
      strengths: strengths.length > 0 ? strengths : ['Dedicação aos estudos', 'Participação ativa'],
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Consistência nos estudos'],
      motivationalMessage,
      goalSuggestions: {
        shortTerm: shortTermGoals,
        longTerm: longTermGoals
      },
      celebrationMoments: [
        {
          achievement: 'Posição no Ranking',
          description: `Você está na posição ${ranking.currentRank} de ${ranking.totalStudents} estudantes`,
          date: new Date()
        }
      ]
    };
  }

  private generateTrends(student: StudentComparisonData, classStats: StudentClassStatistics): {
    rankingHistory: { date: Date; rank: number; totalStudents: number }[];
    performanceHistory: { date: Date; score: number; classAverage: number }[];
  } {
    // Simplified trend data (in a real implementation, this would come from historical data)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    return {
      rankingHistory: [
        { date: twoWeeksAgo, rank: Math.min(classStats.totalStudents, student.overallScore > 70 ? 15 : 25), totalStudents: classStats.totalStudents },
        { date: oneWeekAgo, rank: Math.min(classStats.totalStudents, student.overallScore > 70 ? 12 : 20), totalStudents: classStats.totalStudents },
        { date: now, rank: Math.min(classStats.totalStudents, student.overallScore > 70 ? 8 : 15), totalStudents: classStats.totalStudents }
      ],
      performanceHistory: [
        { date: twoWeeksAgo, score: Math.max(0, student.overallScore - 15), classAverage: classStats.averageScore },
        { date: oneWeekAgo, score: Math.max(0, student.overallScore - 8), classAverage: classStats.averageScore },
        { date: now, score: student.overallScore, classAverage: classStats.averageScore }
      ]
    };
  }
}
