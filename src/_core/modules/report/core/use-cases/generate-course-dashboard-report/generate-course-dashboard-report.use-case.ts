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
import type { LessonProgressRepository } from '../../../../content/infrastructure/repositories/LessonProgressRepository';
import type { InstitutionRepository } from '../../../../institution/infrastructure/repositories/InstitutionRepository';
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
    
    @inject(Register.content.repository.LessonProgressRepository)
    private readonly lessonProgressRepository: LessonProgressRepository,
    
    @inject(Register.institution.repository.InstitutionRepository)
    private readonly institutionRepository: InstitutionRepository
  ) {}

  async execute(input: GenerateCourseDashboardReportInput): Promise<GenerateCourseDashboardReportOutput> {
    // Validate admin access to institution
    await this.validateAdminAccess(input.adminId, input.institutionId);

    // Get institution information
    const institutionInfo = await this.getInstitutionInfo(input.institutionId, input.adminId);

    // Get course overview metrics
    const courseOverview = await this.generateCourseOverview(input.institutionId);

    // Get detailed course metrics
    const courseMetrics = await this.generateCourseMetrics(
      input.institutionId,
      input.courseId,
      input.minimumEnrollments
    );

    // Generate enrollment trends if requested
    const enrollmentTrends = input.includeEnrollmentTrends
      ? await this.generateEnrollmentTrends(input.institutionId, input.dateFrom, input.dateTo)
      : undefined;

    // Generate performance metrics if requested
    const performanceMetrics = input.includePerformanceMetrics
      ? await this.generatePerformanceMetrics(input.institutionId, input.courseId)
      : undefined;

    // Generate instructor metrics if requested
    const instructorMetrics = input.includeInstructorMetrics
      ? await this.generateInstructorMetrics()
      : undefined;

    // Generate revenue analysis if requested
    const revenueAnalysis = input.includeRevenueData
      ? await this.generateRevenueAnalysis(input.institutionId)
      : undefined;

    // Generate student feedback if requested
    const studentFeedback = input.includeStudentFeedback
      ? await this.generateStudentFeedback()
      : undefined;

    // Generate comparative analysis if requested
    const comparativeAnalysis = input.includeComparativeAnalysis
      ? await this.generateComparativeAnalysis(input.institutionId)
      : undefined;

    // Generate insights and recommendations
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

  private async validateAdminAccess(adminId: string, institutionId: string): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Check if admin has access to this institution
    // This would typically involve checking UserInstitution relationship
    // For now, we'll assume the validation passes if the user exists
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
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date()
      }
    };
  }

  private async generateCourseOverview(institutionId: string): Promise<CourseOverview> {
    // Get all courses for the institution
    const courses = await this.courseRepository.listByInstitution(institutionId);

    // Count courses by status (assuming all courses are active for now)
    const totalCourses = courses.length;
    const activeCourses = courses.length; // All courses are considered active
    const draftCourses = 0; // No draft status in current model
    const archivedCourses = 0; // No archived status in current model

    // Get enrollment data
    const allEnrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    const totalEnrollments = allEnrollments.length;
    const averageEnrollmentsPerCourse = totalCourses > 0 ? totalEnrollments / totalCourses : 0;

    // Calculate revenue (courses don't have price field in current model)
    const totalRevenue = 0; // Would need pricing model
    const averageRevenuePerCourse = 0; // Would need pricing model

    return {
      totalCourses,
      activeCourses,
      draftCourses,
      archivedCourses,
      totalEnrollments,
      averageEnrollmentsPerCourse: Math.round(averageEnrollmentsPerCourse * 100) / 100,
      totalRevenue,
      averageRevenuePerCourse: Math.round(averageRevenuePerCourse * 100) / 100
    };
  }

  private async generateCourseMetrics(
    institutionId: string,
    courseId?: string,
    minimumEnrollments?: number
  ): Promise<CourseMetrics[]> {
    // Get courses
    let courses = await this.courseRepository.listByInstitution(institutionId);

    // Filter by specific course if provided
    if (courseId) {
      courses = courses.filter(course => course.id === courseId);
    }

    const courseMetrics: CourseMetrics[] = [];

    for (const course of courses) {
      // Get enrollments for this course
      const enrollments = await this.enrollmentRepository.listByCourse(course.id);
      
      // Apply minimum enrollments filter
      if (minimumEnrollments && enrollments.length < minimumEnrollments) {
        continue;
      }

      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.status === 'ENROLLED').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      // Calculate average time to complete (simplified)
      const completedEnrollmentsWithTime = enrollments.filter(e => e.completedAt && e.enrolledAt);
      const averageTimeToComplete = completedEnrollmentsWithTime.length > 0
        ? completedEnrollmentsWithTime.reduce((sum, e) => {
            const timeDiff = (e.completedAt?.getTime() ?? 0) - e.enrolledAt.getTime();
            return sum + (timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
          }, 0) / completedEnrollmentsWithTime.length
        : 0;

      // Calculate revenue (no pricing model currently)
      const revenue = 0;
      const revenuePerStudent = 0;

      // Get instructor and class count (would need proper class model)
      const instructorCount = 1; // Placeholder
      const classCount = 1; // Placeholder

      // Get rating (would need a rating/review system)
      const rating = 4.0; // Placeholder
      const reviewCount = 0; // Placeholder

      courseMetrics.push({
        courseId: course.id,
        courseName: course.title,
        courseStatus: 'ACTIVE', // All courses considered active
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: 0, // Would need assessment data
        averageTimeToComplete: Math.round(averageTimeToComplete),
        revenue,
        revenuePerStudent: Math.round(revenuePerStudent * 100) / 100,
        instructorCount,
        classCount,
        rating,
        reviewCount,
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
    
    // Filter by date range if provided
    let filteredEnrollments = enrollments;
    if (dateFrom) {
      filteredEnrollments = filteredEnrollments.filter(e => e.enrolledAt >= dateFrom);
    }
    if (dateTo) {
      filteredEnrollments = filteredEnrollments.filter(e => e.enrolledAt <= dateTo);
    }

    // Group by period (simplified - monthly grouping)
    const monthlyGroups = new Map<string, typeof enrollments>();
    
    filteredEnrollments.forEach(enrollment => {
      const monthKey = enrollment.enrolledAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, []);
      }
      monthlyGroups.get(monthKey)!.push(enrollment);
    });

    const trends: EnrollmentTrend[] = [];
    
    for (const [period, periodEnrollments] of monthlyGroups) {
      const newEnrollments = periodEnrollments.length;
      const completedEnrollments = periodEnrollments.filter(e => e.status === 'COMPLETED').length;
      const droppedEnrollments = 0; // No dropped status in current model
      const activeEnrollments = periodEnrollments.filter(e => e.status === 'ENROLLED').length;
      
      const completionRate = newEnrollments > 0 ? (completedEnrollments / newEnrollments) * 100 : 0;
      const retentionRate = newEnrollments > 0 ? ((newEnrollments - droppedEnrollments) / newEnrollments) * 100 : 0;
      
      // Calculate growth rate (simplified)
      const enrollmentGrowthRate = 0; // Would need previous period data

      trends.push({
        period,
        newEnrollments,
        completedEnrollments,
        droppedEnrollments,
        activeEnrollments,
        enrollmentGrowthRate,
        completionRate: Math.round(completionRate * 100) / 100,
        retentionRate: Math.round(retentionRate * 100) / 100
      });
    }

    return trends.sort((a, b) => a.period.localeCompare(b.period));
  }

  private async generatePerformanceMetrics(
    institutionId: string,
    courseId?: string
  ): Promise<PerformanceMetrics[]> {
    let courses = await this.courseRepository.listByInstitution(institutionId);
    
    if (courseId) {
      courses = courses.filter(course => course.id === courseId);
    }

    const performanceMetrics: PerformanceMetrics[] = [];

    for (const course of courses) {
      const enrollments = await this.enrollmentRepository.listByCourse(course.id);
      const studentIds = enrollments.map(e => e.userId);
      
      let allSubmissions: QuestionnaireSubmission[] = [];
      for (const studentId of studentIds) {
        const submissions = await this.questionnaireSubmissionRepository.listByUser(studentId);
        allSubmissions = allSubmissions.concat(submissions);
      }

      const courseSubmissions = allSubmissions.filter(s => s.institutionId === institutionId);
      
      const averageScore = courseSubmissions.length > 0
        ? courseSubmissions.reduce((sum, s) => sum + s.score, 0) / courseSubmissions.length
        : 0;
        
      const passRate = courseSubmissions.length > 0
        ? (courseSubmissions.filter(s => s.passed).length / courseSubmissions.length) * 100
        : 0;

      performanceMetrics.push({
        courseId: course.id,
        courseName: course.title,
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate),
        averageAttempts: 0, // Simplified
        averageTimeSpent: 0, // Simplified
        difficultyRating: 'MEDIUM', // Simplified
        studentSatisfaction: 0, // Simplified
        recommendationRate: 0, // Simplified
        improvementTrend: 'STABLE' // Simplified
      });
    }

    return performanceMetrics;
  }

  private async generateInstructorMetrics(): Promise<InstructorMetrics[]> {
    // Would need proper instructor/class model
    // For now returning empty array
    return [];
  }

  private async generateRevenueAnalysis(institutionId: string): Promise<RevenueAnalysis> {
    // Get course metrics for top revenue courses
    const courseMetrics = await this.generateCourseMetrics(institutionId);
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

  private async generateStudentFeedback(): Promise<StudentFeedback[]> {
    // This would require a feedback/review system
    // For now, returning empty array as this data source doesn't exist yet
    return [];
  }

  private async generateComparativeAnalysis(institutionId: string): Promise<ComparativeAnalysis> {
    // This would require historical data comparison
    const currentEnrollments = await this.enrollmentRepository.listByInstitution(institutionId);
    const currentTotalEnrollments = currentEnrollments.length;
    const currentCompletionRate = currentEnrollments.filter(e => e.status === 'COMPLETED').length / currentTotalEnrollments * 100;

    return {
      currentPeriod: {
        totalEnrollments: currentTotalEnrollments,
        completionRate: currentCompletionRate,
        averageScore: 80, // Would calculate from submissions
        revenue: 0, // No pricing model
        studentSatisfaction: 4.0 // Would calculate from feedback
      },
      comparisonPeriod: {
        totalEnrollments: Math.round(currentTotalEnrollments * 0.9), // Placeholder
        completionRate: currentCompletionRate * 0.95, // Placeholder
        averageScore: 78, // Placeholder
        revenue: 0, // Placeholder
        studentSatisfaction: 3.8 // Placeholder
      },
      changes: {
        enrollmentChange: 10, // Placeholder
        completionRateChange: 5, // Placeholder
        scoreChange: 2.5, // Placeholder
        revenueChange: 0, // Placeholder
        satisfactionChange: 5 // Placeholder
      },
      trends: {
        enrollmentTrend: 'UP',
        performanceTrend: 'UP',
        revenueTrend: 'STABLE',
        satisfactionTrend: 'UP'
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
    const mostSatisfiedStudentsCourses = sortedByRating.slice(0, 5);
    const coursesNeedingAttention = courseMetrics.filter(c => 
      c.completionRate < 40 || c.rating < 3.5
    ).slice(0, 5);

    const actionableInsights: ActionableInsight[] = [];

    // Generate insights based on real data
    if (underperformingCourses.length > 0) {
      actionableInsights.push({
        type: 'RISK',
        priority: 'HIGH',
        title: 'Low Completion Rate Courses Identified',
        description: `${underperformingCourses.length} courses have completion rates below 50%`,
        affectedCourses: underperformingCourses.map(c => c.courseId),
        potentialImpact: 'Reduced student satisfaction and revenue loss',
        recommendedActions: [
          'Review course content and structure',
          'Analyze student feedback',
          'Consider instructor training',
          'Implement engagement strategies'
        ],
        estimatedEffort: 'MEDIUM',
        expectedOutcome: 'Improved completion rates by 15-20%'
      });
    }

    const totalStudentsServed = courseMetrics.reduce((sum, course) => sum + course.totalEnrollments, 0);
    const overallCompletionRate = courseMetrics.length > 0 
      ? courseMetrics.reduce((sum, course) => sum + course.completionRate, 0) / courseMetrics.length
      : 0;
    const averageStudentSatisfaction = courseMetrics.length > 0
      ? courseMetrics.reduce((sum, course) => sum + course.rating, 0) / courseMetrics.length
      : 0;
    const totalRevenueGenerated = courseMetrics.reduce((sum, course) => sum + course.revenue, 0);

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
        instructorUtilization: 85 // Placeholder
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

    // Generate recommendations based on real insights
    if (insights.underperformingCourses.length > 0) {
      recommendations.courseImprovements.push(
        'Review and restructure underperforming courses',
        'Implement interactive elements to increase engagement',
        'Add more practical exercises and real-world examples'
      );
    }

    if (insights.keyMetrics.overallCompletionRate < 70) {
      recommendations.studentExperienceEnhancements.push(
        'Implement progress tracking and milestone celebrations',
        'Create peer support groups and study communities',
        'Provide personalized learning paths'
      );
    }

    recommendations.operationalOptimizations.push(
      'Automate routine administrative tasks',
      'Implement predictive analytics for student success',
      'Optimize resource allocation based on course performance'
    );

    recommendations.marketingOpportunities.push(
      'Promote high-rated courses more prominently',
      'Create testimonials from successful students',
      'Develop referral programs for satisfied students'
    );

    recommendations.instructorDevelopment.push(
      'Provide training on engagement techniques',
      'Share best practices from top-performing instructors',
      'Implement peer mentoring programs'
    );

    recommendations.revenueEnhancement.push(
      'Develop pricing strategy for courses',
      'Create premium course offerings',
      'Implement subscription models'
    );

    return recommendations;
  }
}
