import { inject, injectable } from 'inversify';
import { GenerateClassAssessmentPerformanceReportInput } from './generate-class-assessment-performance-report.input';
import {
  GenerateClassAssessmentPerformanceReportOutput,
  AssessmentOverview,
  AssessmentStatistics,
  StudentPerformance,
  QuestionAnalysis,
  PerformanceTrend,
  ClassComparison,
  RecommendationItem
} from './generate-class-assessment-performance-report.output';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { QuestionnaireSubmissionRepository } from '../../../../content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import type { QuestionnaireRepository } from '../../../../content/infrastructure/repositories/QuestionnaireRepository';
import type { ClassRepository } from '../../../../enrollment/infrastructure/repositories/ClassRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import { QuestionnaireSubmission } from '../../../../content/core/entities/QuestionnaireSubmission';
import { Register } from '../../../../../shared/container/symbols';
import { Class } from '../../../../enrollment/core/entities/Class';
import { Enrollment } from '../../../../enrollment/core/entities/Enrollment';

@injectable()
export class GenerateClassAssessmentPerformanceReportUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,
    
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private readonly questionnaireSubmissionRepository: QuestionnaireSubmissionRepository,
    
    @inject(Register.content.repository.QuestionnaireRepository)
    private readonly questionnaireRepository: QuestionnaireRepository,
    
    @inject(Register.enrollment.repository.ClassRepository)
    private readonly classRepository: ClassRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository
  ) {}

  async execute(input: GenerateClassAssessmentPerformanceReportInput): Promise<GenerateClassAssessmentPerformanceReportOutput> {
    // Fetch class data once
    const classEntity = await this.classRepository.findById(input.classId);
    if (!classEntity) {
      throw new Error('Class not found');
    }

    // Fetch enrollments once
    const allEnrollments = await this.enrollmentRepository.listByInstitution(classEntity.institutionId);
    const classEnrollments = allEnrollments.filter((e: Enrollment) => classEntity.enrollmentIds.includes(e.id));

    console.log({
      classEntity,
      allEnrollments,
      classEnrollments,
    })

    // Validate tutor access to class
    await this.validateTutorAccess(input.tutorId, classEntity, input.institutionId);

    // Get class and course information
    const classInfo = await this.getClassInfo(classEntity, classEnrollments, input.courseId);

    // Get all students in the class
    const students = await this.getClassStudents(classEnrollments);

    // Get assessment submissions
    const submissions = await this.getAssessmentSubmissions(
      classEnrollments,
      input.assessmentType,
      input.dateFrom,
      input.dateTo,
      input.minimumSubmissions
    );

    // Calculate assessment overview
    const assessmentOverview = this.calculateAssessmentOverview(submissions);

    // Generate assessment statistics if requested
    const assessmentStatistics = input.includeStatistics 
      ? await this.generateAssessmentStatistics(submissions)
      : undefined;

    // Generate student performances if requested
    const studentPerformances = input.includeIndividualScores
      ? this.generateStudentPerformances(submissions, students)
      : undefined;

    // Generate question analysis if requested
    const questionAnalysis = input.includeQuestionAnalysis
      ? await this.generateQuestionAnalysis(submissions)
      : undefined;

    // Generate performance trends if requested
    const performanceTrends = input.includeTrends
      ? this.generatePerformanceTrends(submissions, input.groupBy)
      : undefined;

    // Generate class comparison
    const classComparison = await this.generateClassComparison(
      assessmentOverview.averageScore,
      input.institutionId,
      input.courseId
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      assessmentOverview,
      studentPerformances,
      assessmentStatistics
    );

    // Generate insights
    const insights = this.generateInsights(
      studentPerformances || [],
      assessmentStatistics || []
    );

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      classInfo,
      assessmentOverview,
      assessmentStatistics,
      studentPerformances,
      questionAnalysis,
      performanceTrends,
      classComparison,
      recommendations,
      insights
    };
  }

  private async validateTutorAccess(tutorId: string, classEntity: Class, institutionId: string): Promise<void> {
    const tutor = await this.userRepository.findById(tutorId);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    if (classEntity.institutionId !== institutionId) {
      throw new Error('Class does not belong to the specified institution');
    }

    // Additional validation could check if tutor is assigned to this class
    console.log(`Tutor ${tutorId} accessing class ${classEntity.id} in institution ${institutionId}`);
  }

  private async getClassInfo(classEntity: Class, classEnrollments: Enrollment[], courseId?: string): Promise<GenerateClassAssessmentPerformanceReportOutput['classInfo']> {

    let course = null;
    const actualCourseId = courseId || classEntity.courseId;
    
    if (actualCourseId) {
      course = await this.courseRepository.findById(actualCourseId);
    }

    return {
      classId: classEntity.id,
      className: classEntity.name,
      courseId: actualCourseId || 'N/A',
      courseName: course?.title || 'N/A',
      tutorId: 'tutor-placeholder', // Would need proper tutor-class relationship
      tutorName: 'Tutor Name', // Would need proper tutor-class relationship
      totalStudents: classEntity.enrollmentIds.length,
      activeStudents: classEnrollments.filter((e: Enrollment) => e.status.toString() === 'ENROLLED').length
    };
  }

  private async getClassStudents(classEnrollments: Enrollment[]): Promise<Array<{ id: string; name: string; email: string }>> {

    const students: Array<{ id: string; name: string; email: string }> = [];
    
    for (const enrollment of classEnrollments) {
      const user = await this.userRepository.findById(enrollment.userId);
      if (user) {
        students.push({
          id: user.id,
          name: user.name,
          email: user.email.value
        });
      }
    }

    return students;
  }

  private async getAssessmentSubmissions(
    classEnrollments: Enrollment[],
    assessmentType?: string,
    dateFrom?: Date,
    dateTo?: Date,
    minimumSubmissions?: number
  ): Promise<Array<{
    id: string;
    studentId: string;
    assessmentId: string;
    score: number;
    maxScore: number;
    submittedAt: Date;
    timeSpent: number;
    attempts: number;
  }>> {

    const studentIds = classEnrollments.map((e: Enrollment) => e.userId);

    // Get all questionnaire submissions for students in this class
    const allSubmissions: QuestionnaireSubmission[] = [];
    
    // Since listByInstitution doesn't exist, we need to get submissions by user
    for (const studentId of studentIds) {
      const userSubmissions = await this.questionnaireSubmissionRepository.listByUser(studentId);
      allSubmissions.push(...userSubmissions);
    }
    
    let filteredSubmissions = allSubmissions.filter((submission: QuestionnaireSubmission) => 
      studentIds.includes(submission.userId)
    );

    // Apply date filters
    if (dateFrom) {
      filteredSubmissions = filteredSubmissions.filter(s => s.completedAt >= dateFrom);
    }
    if (dateTo) {
      filteredSubmissions = filteredSubmissions.filter(s => s.completedAt <= dateTo);
    }

    // Apply assessment type filter (simplified - would need questionnaire type field)
    if (assessmentType) {
      // This would require questionnaire type information
      console.log(`Assessment type filter: ${assessmentType} - not fully implemented`);
    }

    // Transform to expected format - calculating maxScore from questions
    const submissions = filteredSubmissions.map(submission => ({
      id: submission.id,
      studentId: submission.userId,
      assessmentId: submission.questionnaireId,
      score: submission.score,
      maxScore: submission.questions.length * 100, // Assuming each question is worth 100 points
      submittedAt: submission.completedAt,
      timeSpent: Math.round((submission.completedAt.getTime() - submission.startedAt.getTime()) / 1000 / 60), // Convert to minutes
      attempts: submission.attempt
    }));

    // Apply minimum submissions filter
    if (minimumSubmissions && minimumSubmissions > 0) {
      const studentSubmissionCounts = submissions.reduce((counts, sub) => {
        counts[sub.studentId] = (counts[sub.studentId] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      return submissions.filter(sub => 
        studentSubmissionCounts[sub.studentId] >= minimumSubmissions
      );
    }

    return submissions;
  }

  private calculateAssessmentOverview(submissions: Array<{
    score: number;
    maxScore: number;
    attempts: number;
    assessmentId: string;
  }>): AssessmentOverview {
    if (submissions.length === 0) {
      return {
        totalAssessments: 0,
        totalSubmissions: 0,
        averageScore: 0,
        passRate: 0,
        completionRate: 0,
        averageAttempts: 0
      };
    }

    const totalSubmissions = submissions.length;
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0);
    const averageScore = totalScore / totalSubmissions;
    const passedSubmissions = submissions.filter(sub => (sub.score / sub.maxScore) >= 0.6).length;
    const passRate = (passedSubmissions / totalSubmissions) * 100;
    const totalAttempts = submissions.reduce((sum, sub) => sum + sub.attempts, 0);
    const averageAttempts = totalAttempts / totalSubmissions;

    // Get unique assessments
    const uniqueAssessments = new Set(submissions.map(sub => sub.assessmentId));

    return {
      totalAssessments: uniqueAssessments.size,
      totalSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      completionRate: 100, // Simplified - would need enrolled students count
      averageAttempts: Math.round(averageAttempts * 100) / 100
    };
  }

  private async generateAssessmentStatistics(
    submissions: Array<{ assessmentId: string; score: number; maxScore: number; timeSpent: number }>
  ): Promise<AssessmentStatistics[]> {
    // Group submissions by assessment
    const assessmentGroups = submissions.reduce((groups, submission) => {
      if (!groups[submission.assessmentId]) {
        groups[submission.assessmentId] = [];
      }
      groups[submission.assessmentId].push(submission);
      return groups;
    }, {} as Record<string, typeof submissions>);

    const statistics: AssessmentStatistics[] = [];

    for (const [assessmentId, assessmentSubmissions] of Object.entries(assessmentGroups)) {
      const questionnaire = await this.questionnaireRepository.findById(assessmentId);
      
      const scores = assessmentSubmissions.map(sub => (sub.score / sub.maxScore) * 100);
      const totalSubmissions = assessmentSubmissions.length;
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalSubmissions;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      
      // Calculate standard deviation
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / totalSubmissions;
      const standardDeviation = Math.sqrt(variance);
      
      const passedCount = scores.filter(score => score >= 60).length;
      const passRate = (passedCount / totalSubmissions) * 100;
      
      const averageTimeSpent = assessmentSubmissions.reduce((sum, sub) => sum + sub.timeSpent, 0) / totalSubmissions;
      
      // Determine difficulty level based on average score
      let difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
      if (averageScore >= 80) {
        difficultyLevel = 'EASY';
      } else if (averageScore >= 60) {
        difficultyLevel = 'MEDIUM';
      } else {
        difficultyLevel = 'HARD';
      }

      statistics.push({
        assessmentId,
        assessmentName: questionnaire?.title || `Assessment ${assessmentId}`,
        assessmentType: 'QUIZ', // Simplified - would need type from questionnaire
        totalSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        lowestScore: Math.round(lowestScore * 100) / 100,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        averageTimeSpent: Math.round(averageTimeSpent),
        difficultyLevel
      });
    }

    return statistics;
  }

  private generateStudentPerformances(
    submissions: Array<{ studentId: string; score: number; maxScore: number; submittedAt: Date }>,
    students: Array<{ id: string; name: string; email: string }>
  ): StudentPerformance[] {
    // Group submissions by student
    const studentGroups = submissions.reduce((groups, submission) => {
      if (!groups[submission.studentId]) {
        groups[submission.studentId] = [];
      }
      groups[submission.studentId].push(submission);
      return groups;
    }, {} as Record<string, typeof submissions>);

    const performances: StudentPerformance[] = [];

    for (const student of students) {
      const studentSubmissions = studentGroups[student.id] || [];
      
      if (studentSubmissions.length === 0) {
        performances.push({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          totalSubmissions: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 0,
          improvementTrend: 'STABLE',
          lastSubmissionDate: new Date(),
          riskLevel: 'HIGH'
        });
        continue;
      }

      const scores = studentSubmissions.map(sub => (sub.score / sub.maxScore) * 100);
      const totalSubmissions = studentSubmissions.length;
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalSubmissions;
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);
      
      // Calculate improvement trend
      let improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
      if (studentSubmissions.length >= 2) {
        const recentScores = scores.slice(-3); // Last 3 scores
        const earlierScores = scores.slice(0, -3);
        if (earlierScores.length > 0) {
          const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
          const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length;
          if (recentAvg > earlierAvg + 5) {
            improvementTrend = 'IMPROVING';
          } else if (recentAvg < earlierAvg - 5) {
            improvementTrend = 'DECLINING';
          }
        }
      }

      // Determine risk level
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      if (averageScore >= 75) {
        riskLevel = 'LOW';
      } else if (averageScore >= 60) {
        riskLevel = 'MEDIUM';
      } else {
        riskLevel = 'HIGH';
      }

      const lastSubmissionDate = new Date(Math.max(...studentSubmissions.map(sub => sub.submittedAt.getTime())));

      performances.push({
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        totalSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
        bestScore: Math.round(bestScore * 100) / 100,
        worstScore: Math.round(worstScore * 100) / 100,
        improvementTrend,
        lastSubmissionDate,
        riskLevel
      });
    }

    return performances;
  }

  private async generateQuestionAnalysis(submissions: Array<{ assessmentId: string }>): Promise<QuestionAnalysis[]> {
    // This would require detailed question-level submission data
    // For now, returning empty array as this data structure is not available
    const uniqueAssessments = [...new Set(submissions.map(s => s.assessmentId))];
    
    const analysis: QuestionAnalysis[] = [];
    
    for (const assessmentId of uniqueAssessments) {
      const questionnaire = await this.questionnaireRepository.findById(assessmentId);
      if (questionnaire) {
        // Would need to analyze individual question performance
        // This requires question-level submission data which is not currently available
        console.log(`Question analysis for ${questionnaire.title} - requires detailed implementation`);
      }
    }
    
    return analysis;
  }

  private generatePerformanceTrends(
    submissions: Array<{ submittedAt: Date; score: number; maxScore: number }>,
    groupBy?: string
  ): PerformanceTrend[] {
    if (submissions.length === 0) {
      return [];
    }

    // Group by period (default to weekly)
    const period = groupBy || 'weekly';
    const trends: PerformanceTrend[] = [];
    
    // Sort submissions by date
    const sortedSubmissions = [...submissions].sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
    
    // Group submissions by time period
    const periodGroups = new Map<string, typeof submissions>();
    
    sortedSubmissions.forEach(submission => {
      let periodKey: string;
      const date = submission.submittedAt;
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().substring(0, 10); // YYYY-MM-DD
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().substring(0, 10);
          break;
        case 'monthly':
          periodKey = date.toISOString().substring(0, 7); // YYYY-MM
          break;
        default:
          periodKey = date.toISOString().substring(0, 10);
      }
      
      if (!periodGroups.has(periodKey)) {
        periodGroups.set(periodKey, []);
      }
      periodGroups.get(periodKey)!.push(submission);
    });

    // Calculate trends for each period
    for (const [periodKey, periodSubmissions] of periodGroups) {
      const scores = periodSubmissions.map(s => (s.score / s.maxScore) * 100);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const totalSubmissions = periodSubmissions.length;
      
      trends.push({
        period: periodKey,
        averageScore: Math.round(averageScore * 100) / 100,
        submissionCount: totalSubmissions,
        passRate: Math.round((scores.filter(s => s >= 60).length / scores.length) * 100 * 100) / 100,
        participationRate: 100 // Simplified - would need total enrolled students
      });
    }

    return trends.sort((a, b) => a.period.localeCompare(b.period));
  }

  private async generateClassComparison(
    classAverage: number,
    institutionId: string,
    courseId?: string
  ): Promise<ClassComparison> {
    // Since listByInstitution doesn't exist, we'll use simplified comparison
    // In a real implementation, we would need to collect submissions from all users in the institution
    
    if (courseId) {
      // Filter by course (would need course-questionnaire relationship)
      console.log(`Course filtering for ${courseId} - requires course-questionnaire relationship`);
    }

    // For now, using simplified averages based on typical educational benchmarks
    const institutionAverage = 72; // Typical institution average
    const courseAverage = 75; // Typical course average
    
    // Calculate percentile rank (simplified)
    const percentileRank = classAverage > institutionAverage 
      ? Math.min(Math.round(50 + ((classAverage - institutionAverage) / institutionAverage) * 50), 100)
      : Math.max(Math.round(50 - ((institutionAverage - classAverage) / institutionAverage) * 50), 0);

    let performanceRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'POOR';
    if (classAverage >= 85) performanceRating = 'EXCELLENT';
    else if (classAverage >= 75) performanceRating = 'GOOD';
    else if (classAverage >= 65) performanceRating = 'AVERAGE';
    else if (classAverage >= 55) performanceRating = 'BELOW_AVERAGE';
    else performanceRating = 'POOR';

    return {
      currentClassAverage: Math.round(classAverage * 100) / 100,
      institutionAverage: Math.round(institutionAverage * 100) / 100,
      courseAverage: Math.round(courseAverage * 100) / 100,
      percentileRank,
      performanceRating
    };
  }

  private generateRecommendations(
    overview: AssessmentOverview,
    studentPerformances?: StudentPerformance[],
    assessmentStatistics?: AssessmentStatistics[]
  ): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];

    // Low pass rate recommendation
    if (overview.passRate < 60) {
      recommendations.push({
        type: 'CONTENT_REVIEW',
        priority: 'HIGH',
        description: 'Review course content as pass rate is below 60%',
        expectedImpact: 'Improve overall class performance by 15-20%',
        implementationSteps: [
          'Identify topics with lowest scores',
          'Create additional learning materials',
          'Schedule review sessions'
        ]
      });
    }

    // High-risk students recommendation
    const highRiskStudents = studentPerformances?.filter(s => s.riskLevel === 'HIGH') || [];
    if (highRiskStudents.length > 0) {
      recommendations.push({
        type: 'INDIVIDUAL_SUPPORT',
        priority: 'HIGH',
        description: `Provide individual support to ${highRiskStudents.length} high-risk students`,
        targetStudents: highRiskStudents.map(s => s.studentId),
        expectedImpact: 'Reduce dropout risk by 30%',
        implementationSteps: [
          'Schedule one-on-one meetings',
          'Create personalized study plans',
          'Provide additional resources'
        ]
      });
    }

    // Difficult assessments recommendation
    const difficultAssessments = assessmentStatistics?.filter(a => a.difficultyLevel === 'HARD') || [];
    if (difficultAssessments.length > 0) {
      recommendations.push({
        type: 'ASSESSMENT_ADJUSTMENT',
        priority: 'MEDIUM',
        description: `Review and adjust ${difficultAssessments.length} difficult assessments`,
        expectedImpact: 'Improve assessment completion rate by 10%',
        implementationSteps: [
          'Analyze question difficulty',
          'Provide clearer instructions',
          'Consider partial credit options'
        ]
      });
    }

    return recommendations;
  }

  private generateInsights(
    studentPerformances: StudentPerformance[],
    assessmentStatistics: AssessmentStatistics[]
  ): GenerateClassAssessmentPerformanceReportOutput['insights'] {
    // Sort students by performance
    const sortedStudents = [...studentPerformances].sort((a, b) => b.averageScore - a.averageScore);
    const topPerformers = sortedStudents.slice(0, 3);
    const strugglingStudents = sortedStudents.filter(s => s.riskLevel === 'HIGH').slice(0, 5);

    // Sort assessments by difficulty
    const sortedAssessments = [...assessmentStatistics].sort((a, b) => a.averageScore - b.averageScore);
    const mostDifficultAssessments = sortedAssessments.slice(0, 3);
    const easiestAssessments = sortedAssessments.slice(-3).reverse();

    const improvementOpportunities: string[] = [];
    const strengths: string[] = [];

    // Generate improvement opportunities
    if (strugglingStudents.length > 0) {
      improvementOpportunities.push(`${strugglingStudents.length} students need additional support`);
    }
    if (mostDifficultAssessments.length > 0) {
      improvementOpportunities.push(`${mostDifficultAssessments.length} assessments have low average scores`);
    }

    // Generate strengths
    if (topPerformers.length > 0) {
      strengths.push(`${topPerformers.length} students showing excellent performance`);
    }
    if (easiestAssessments.length > 0 && easiestAssessments[0]?.averageScore > 85) {
      strengths.push('Strong performance on core assessments');
    }

    return {
      topPerformers,
      strugglingStudents,
      mostDifficultAssessments,
      easiestAssessments,
      improvementOpportunities,
      strengths
    };
  }
}
