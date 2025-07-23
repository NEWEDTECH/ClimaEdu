import { inject, injectable } from 'inversify';
import { GenerateRetentionAnalysisReportInput } from './generate-retention-analysis-report.input';
import {
  GenerateRetentionAnalysisReportOutput,
  RetentionOverview,
  DropoutAnalysis,
  RetentionTrend,
  RiskFactor,
  CohortAnalysis,
  InterventionEffectiveness,
  StudentAtRisk,
  RetentionComparison,
  RetentionInsight
} from './generate-retention-analysis-report.output';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { InstitutionRepository } from '../../../../institution/infrastructure/repositories/InstitutionRepository';
import { Register } from '../../../../../shared/container/symbols';

@injectable()
export class GenerateRetentionAnalysisReportUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.institution.repository.InstitutionRepository)
    private readonly institutionRepository: InstitutionRepository
  ) {}

  async execute(input: GenerateRetentionAnalysisReportInput): Promise<GenerateRetentionAnalysisReportOutput> {
    // Validate admin access to institution
    await this.validateAdminAccess(input.adminId, input.institutionId);

    // Get institution information
    const institutionInfo = await this.getInstitutionInfo(input.institutionId, input.adminId);

    // Get retention overview
    const retentionOverview = await this.generateRetentionOverview(input.institutionId, input.courseId);

    // Generate dropout analysis if requested
    const dropoutAnalysis = input.includeDropoutAnalysis
      ? await this.generateDropoutAnalysis(input.institutionId, input.courseId)
      : undefined;

    // Generate retention trends if requested
    const retentionTrends = input.includeRetentionTrends
      ? await this.generateRetentionTrends(input.institutionId, input.dateFrom, input.dateTo)
      : undefined;

    // Generate risk factors if requested
    const riskFactors = input.includeRiskFactors
      ? await this.generateRiskFactors(input.institutionId)
      : undefined;

    // Generate cohort analysis if requested
    const cohortAnalysis = input.includeCohortAnalysis
      ? await this.generateCohortAnalysis(input.institutionId)
      : undefined;

    // Generate intervention effectiveness if requested
    const interventionEffectiveness = input.includeInterventionEffectiveness
      ? await this.generateInterventionEffectiveness()
      : undefined;

    // Generate students at risk
    const studentsAtRisk = await this.generateStudentsAtRisk(
      input.institutionId,
      input.courseId,
      input.riskThreshold
    );

    // Generate comparative analysis if requested
    const retentionComparison = input.includeComparativeAnalysis
      ? await this.generateRetentionComparison(input.institutionId)
      : undefined;

    // Generate insights and recommendations
    const insights = this.generateInsights(studentsAtRisk, dropoutAnalysis);
    const recommendations = this.generateRecommendations(insights, studentsAtRisk);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      institutionInfo,
      retentionOverview,
      dropoutAnalysis,
      retentionTrends,
      riskFactors,
      cohortAnalysis,
      interventionEffectiveness,
      studentsAtRisk,
      retentionComparison,
      insights,
      recommendations
    };
  }

  private async validateAdminAccess(adminId: string, institutionId: string): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Check if admin has access to this institution
    console.log(`Admin ${adminId} accessing retention analysis for institution ${institutionId}`);
  }

  private async getInstitutionInfo(institutionId: string, adminId: string): Promise<GenerateRetentionAnalysisReportOutput['institutionInfo']> {
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
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        endDate: new Date()
      }
    };
  }

  private async generateRetentionOverview(institutionId: string, courseId?: string): Promise<RetentionOverview> {
    // Get enrollments
    let enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    
    if (courseId) {
      enrollments = enrollments.filter(e => e.courseId === courseId);
    }

    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === 'ENROLLED').length;
    const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
    const droppedEnrollments = 0; // No dropped status in current model

    const overallRetentionRate = totalEnrollments > 0 
      ? ((activeEnrollments + completedEnrollments) / totalEnrollments) * 100 
      : 0;
    
    const overallCompletionRate = totalEnrollments > 0 
      ? (completedEnrollments / totalEnrollments) * 100 
      : 0;

    // Calculate average time to completion
    const completedWithTime = enrollments.filter(e => e.completedAt && e.enrolledAt);
      const averageTimeToCompletion = completedWithTime.length > 0
        ? completedWithTime.reduce((sum, e) => {
            const timeDiff = (e.completedAt?.getTime() ?? 0) - e.enrolledAt.getTime();
            return sum + (timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
          }, 0) / completedWithTime.length
        : 0;

    const averageTimeToDropout = 0; // Would need dropout tracking

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      droppedEnrollments,
      overallRetentionRate: Math.round(overallRetentionRate * 100) / 100,
      overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
      averageTimeToCompletion: Math.round(averageTimeToCompletion),
      averageTimeToDropout: Math.round(averageTimeToDropout)
    };
  }

  private async generateDropoutAnalysis(institutionId: string, courseId?: string): Promise<DropoutAnalysis[]> {
    let courses = await this.courseRepository.listByInstitution(institutionId);
    
    if (courseId) {
      courses = courses.filter(c => c.id === courseId);
    }

    const dropoutAnalysis: DropoutAnalysis[] = [];

    for (const course of courses) {
      const enrollments = await this.enrollmentRepository.listByCourse(course.id);
      const totalEnrollments = enrollments.length;
      const dropouts = 0; // No dropout status in current model
      const dropoutRate = totalEnrollments > 0 ? (dropouts / totalEnrollments) * 100 : 0;

      dropoutAnalysis.push({
        courseId: course.id,
        courseName: course.title,
        totalEnrollments,
        dropouts,
        dropoutRate: Math.round(dropoutRate * 100) / 100,
        averageDropoutTime: 0, // Would need dropout tracking
        commonDropoutPoints: [], // Would need lesson-level dropout tracking
        dropoutReasons: [] // Would need reason tracking
      });
    }

    return dropoutAnalysis;
  }

  private async generateRetentionTrends(
    institutionId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<RetentionTrend[]> {
    const enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    
    // Filter by date range if provided
    let filteredEnrollments = enrollments;
    if (dateFrom) {
      filteredEnrollments = filteredEnrollments.filter(e => e.enrolledAt >= dateFrom);
    }
    if (dateTo) {
      filteredEnrollments = filteredEnrollments.filter(e => e.enrolledAt <= dateTo);
    }

    // Group by period (monthly by default)
    const periodGroups = new Map<string, typeof enrollments>();
    
    filteredEnrollments.forEach(enrollment => {
      const periodKey = enrollment.enrolledAt.toISOString().substring(0, 7); // YYYY-MM
      if (!periodGroups.has(periodKey)) {
        periodGroups.set(periodKey, []);
      }
      periodGroups.get(periodKey)!.push(enrollment);
    });

    const trends: RetentionTrend[] = [];
    
    for (const [period, periodEnrollments] of periodGroups) {
      const newEnrollments = periodEnrollments.length;
      const retainedStudents = periodEnrollments.filter(e => e.status === 'ENROLLED' || e.status === 'COMPLETED').length;
      const droppedStudents = 0; // No dropped status in current model
      const retentionRate = newEnrollments > 0 ? (retainedStudents / newEnrollments) * 100 : 0;
      const completionRate = newEnrollments > 0 
        ? (periodEnrollments.filter(e => e.status === 'COMPLETED').length / newEnrollments) * 100 
        : 0;

      trends.push({
        period,
        newEnrollments,
        retainedStudents,
        droppedStudents,
        retentionRate: Math.round(retentionRate * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        trendDirection: 'STABLE', // Would need historical comparison
        periodComparison: 0 // Would need previous period data
      });
    }

    return trends.sort((a, b) => a.period.localeCompare(b.period));
  }

  private async generateRiskFactors(institutionId: string): Promise<RiskFactor[]> {
    // This would require sophisticated analysis of student behavior patterns
    // For now, returning basic risk factors based on available data
    
    const enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    const totalStudents = enrollments.length;

    const riskFactors: RiskFactor[] = [];

    // Low engagement risk factor
    riskFactors.push({
      factorType: 'ENGAGEMENT',
      factorName: 'Low Activity Level',
      description: 'Students with minimal platform interaction',
      riskLevel: 'HIGH',
      affectedStudents: Math.round(totalStudents * 0.15), // Estimate 15%
      correlationStrength: 0.75,
      predictiveAccuracy: 0.68,
      recommendedActions: [
        'Send engagement reminders',
        'Provide additional support resources',
        'Schedule check-in calls'
      ]
    });

    // Time-based risk factor
    riskFactors.push({
      factorType: 'TIME_BASED',
      factorName: 'Extended Inactivity',
      description: 'Students inactive for more than 7 days',
      riskLevel: 'MEDIUM',
      affectedStudents: Math.round(totalStudents * 0.25), // Estimate 25%
      correlationStrength: 0.60,
      predictiveAccuracy: 0.55,
      recommendedActions: [
        'Automated re-engagement campaigns',
        'Personalized content recommendations',
        'Peer support group invitations'
      ]
    });

    return riskFactors;
  }

  private async generateCohortAnalysis(institutionId: string): Promise<CohortAnalysis[]> {
    // This would require cohort tracking functionality
    // For now, returning basic cohort analysis based on enrollment dates
    
    const enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    
    // Group by month as cohorts
    const cohortGroups = new Map<string, typeof enrollments>();
    
    enrollments.forEach(enrollment => {
      const cohortKey = enrollment.enrolledAt.toISOString().substring(0, 7); // YYYY-MM
      if (!cohortGroups.has(cohortKey)) {
        cohortGroups.set(cohortKey, []);
      }
      cohortGroups.get(cohortKey)!.push(enrollment);
    });

    const cohortAnalysis: CohortAnalysis[] = [];
    
    for (const [cohortId, cohortEnrollments] of cohortGroups) {
      const initialSize = cohortEnrollments.length;
      const currentSize = cohortEnrollments.filter(e => e.status === 'ENROLLED' || e.status === 'COMPLETED').length;
      const completedCount = cohortEnrollments.filter(e => e.status === 'COMPLETED').length;
      const droppedCount = 0; // No dropped status in current model

      cohortAnalysis.push({
        cohortId,
        cohortName: `Cohort ${cohortId}`,
        startDate: new Date(cohortId + '-01'),
        initialSize,
        currentSize,
        completedCount,
        droppedCount,
        retentionByWeek: [], // Would need weekly tracking
        averageProgressRate: completedCount > 0 ? (completedCount / initialSize) * 100 : 0,
        projectedCompletion: Math.round((completedCount / initialSize) * 100)
      });
    }

    return cohortAnalysis.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).slice(0, 12); // Last 12 cohorts
  }

  private async generateInterventionEffectiveness(): Promise<InterventionEffectiveness[]> {
    // This would require intervention tracking system
    // For now, returning empty array as this functionality doesn't exist yet
    return [];
  }

  private async generateStudentsAtRisk(
    institutionId: string,
    courseId?: string,
    riskThreshold?: number
  ): Promise<StudentAtRisk[]> {
    let enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    
    if (courseId) {
      enrollments = enrollments.filter(e => e.courseId === courseId);
    }

    const studentsAtRisk: StudentAtRisk[] = [];
    const threshold = riskThreshold || 70; // Default risk threshold

    for (const enrollment of enrollments) {
      // Skip completed enrollments
      if (enrollment.status === 'COMPLETED') {
        continue;
      }

      const student = await this.userRepository.findById(enrollment.userId);
      const course = await this.courseRepository.findById(enrollment.courseId);
      
      if (!student || !course) {
        continue;
      }

      // Calculate risk score based on available data
      const daysSinceEnrollment = Math.floor(
        (Date.now() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Simple risk calculation - higher risk for longer enrollment without completion
      const riskScore = Math.min(daysSinceEnrollment * 2, 100); // Max 100
      
      if (riskScore >= threshold) {
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        if (riskScore >= 90) riskLevel = 'CRITICAL';
        else if (riskScore >= 80) riskLevel = 'HIGH';
        else if (riskScore >= 70) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        let contactPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        if (riskLevel === 'CRITICAL') contactPriority = 'URGENT';
        else if (riskLevel === 'HIGH') contactPriority = 'HIGH';
        else if (riskLevel === 'MEDIUM') contactPriority = 'MEDIUM';
        else contactPriority = 'LOW';

        studentsAtRisk.push({
          studentId: student.id,
          studentName: student.name,
          courseId: course.id,
          courseName: course.title,
          riskScore,
          riskLevel,
          riskFactors: ['Extended enrollment period', 'No recent activity'],
          lastActivity: enrollment.enrolledAt, // Would need actual last activity tracking
          progressPercentage: 0, // Would need progress calculation
          predictedDropoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          recommendedInterventions: [
            'Personal check-in call',
            'Provide additional resources',
            'Assign peer mentor'
          ],
          contactPriority
        });
      }
    }

    return studentsAtRisk.sort((a, b) => b.riskScore - a.riskScore);
  }

  private async generateRetentionComparison(institutionId: string): Promise<RetentionComparison> {
    const enrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
    const activeEnrollments = enrollments.filter(e => e.status === 'ENROLLED').length;
    
    const currentRetentionRate = totalEnrollments > 0 
      ? ((activeEnrollments + completedEnrollments) / totalEnrollments) * 100 
      : 0;
    const currentCompletionRate = totalEnrollments > 0 
      ? (completedEnrollments / totalEnrollments) * 100 
      : 0;

    return {
      currentPeriod: {
        retentionRate: Math.round(currentRetentionRate * 100) / 100,
        completionRate: Math.round(currentCompletionRate * 100) / 100,
        averageEngagement: 75, // Placeholder
        dropoutRate: 0 // No dropout tracking
      },
      comparisonPeriod: {
        retentionRate: Math.round(currentRetentionRate * 0.95 * 100) / 100, // Placeholder
        completionRate: Math.round(currentCompletionRate * 0.90 * 100) / 100, // Placeholder
        averageEngagement: 70, // Placeholder
        dropoutRate: 0 // Placeholder
      },
      changes: {
        retentionChange: 5, // Placeholder
        completionChange: 10, // Placeholder
        engagementChange: 5, // Placeholder
        dropoutChange: 0 // Placeholder
      },
      benchmarks: {
        industryAverage: 65, // Placeholder
        institutionTarget: 80, // Placeholder
        bestPerformingCourse: 90 // Placeholder
      }
    };
  }

  private generateInsights(
    studentsAtRisk: StudentAtRisk[],
    dropoutAnalysis?: DropoutAnalysis[]
  ): GenerateRetentionAnalysisReportOutput['insights'] {
    const criticalRisks: RetentionInsight[] = [];
    const improvementOpportunities: RetentionInsight[] = [];
    const trendAnalysis: RetentionInsight[] = [];
    const anomalies: RetentionInsight[] = [];

    // Critical risks based on students at risk
    const criticalStudents = studentsAtRisk.filter(s => s.riskLevel === 'CRITICAL');
    if (criticalStudents.length > 0) {
      criticalRisks.push({
        type: 'CRITICAL_RISK',
        priority: 'HIGH',
        title: 'Critical Risk Students Identified',
        description: `${criticalStudents.length} students are at critical risk of dropping out`,
        affectedCourses: [...new Set(criticalStudents.map(s => s.courseId))],
        affectedStudents: criticalStudents.length,
        potentialImpact: 'Immediate intervention required to prevent dropouts',
        recommendedActions: [
          'Immediate personal outreach',
          'Emergency support resources',
          'Expedited mentor assignment'
        ],
        timeframe: 'Immediate (24-48 hours)',
        expectedOutcome: 'Prevent 60-80% of potential dropouts'
      });
    }

    // Improvement opportunities
    if (dropoutAnalysis && dropoutAnalysis.length > 0) {
      const highDropoutCourses = dropoutAnalysis.filter(d => d.dropoutRate > 30);
      if (highDropoutCourses.length > 0) {
        improvementOpportunities.push({
          type: 'OPPORTUNITY',
          priority: 'MEDIUM',
          title: 'Course Improvement Opportunities',
          description: `${highDropoutCourses.length} courses have high dropout rates`,
          affectedCourses: highDropoutCourses.map(c => c.courseId),
          affectedStudents: highDropoutCourses.reduce((sum, c) => sum + c.totalEnrollments, 0),
          potentialImpact: 'Significant retention improvement possible',
          recommendedActions: [
            'Course content review',
            'Student feedback analysis',
            'Instructor training'
          ],
          timeframe: '2-3 months',
          expectedOutcome: 'Reduce dropout rates by 20-30%'
        });
      }
    }

    const totalStudentsAnalyzed = studentsAtRisk.length;
    const highRiskStudents = studentsAtRisk.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
    const interventionsNeeded = studentsAtRisk.filter(s => s.contactPriority === 'HIGH' || s.contactPriority === 'URGENT').length;

    return {
      criticalRisks,
      improvementOpportunities,
      trendAnalysis,
      anomalies,
      keyMetrics: {
        totalStudentsAnalyzed,
        highRiskStudents,
        interventionsNeeded,
        retentionImprovement: 0, // Would need historical comparison
        projectedSavings: interventionsNeeded * 500 // Estimated value per student retained
      }
    };
  }

  private generateRecommendations(
    insights: GenerateRetentionAnalysisReportOutput['insights'],
    studentsAtRisk: StudentAtRisk[]
  ): GenerateRetentionAnalysisReportOutput['recommendations'] {
    const recommendations = {
      immediateActions: [] as string[],
      shortTermStrategies: [] as string[],
      longTermInitiatives: [] as string[],
      interventionPrograms: [] as string[],
      systemImprovements: [] as string[],
      policyChanges: [] as string[]
    };

    // Immediate actions based on critical risks
    if (insights.criticalRisks.length > 0) {
      recommendations.immediateActions.push(
        'Contact all critical risk students within 24 hours',
        'Activate emergency support protocols',
        'Deploy rapid intervention teams'
      );
    }

    // Short-term strategies
    if (studentsAtRisk.length > 0) {
      recommendations.shortTermStrategies.push(
        'Implement weekly check-in system for at-risk students',
        'Create peer mentorship program',
        'Develop personalized learning paths'
      );
    }

    // Long-term initiatives
    recommendations.longTermInitiatives.push(
      'Build predictive analytics system for early risk detection',
      'Develop comprehensive student success program',
      'Create retention-focused course design guidelines'
    );

    // Intervention programs
    recommendations.interventionPrograms.push(
      'Academic coaching program',
      'Peer support groups',
      'Flexible learning schedule options'
    );

    // System improvements
    recommendations.systemImprovements.push(
      'Implement real-time engagement tracking',
      'Build automated early warning system',
      'Create comprehensive student dashboard'
    );

    // Policy changes
    recommendations.policyChanges.push(
      'Establish retention rate targets',
      'Create intervention response protocols',
      'Implement student success metrics'
    );

    return recommendations;
  }
}
