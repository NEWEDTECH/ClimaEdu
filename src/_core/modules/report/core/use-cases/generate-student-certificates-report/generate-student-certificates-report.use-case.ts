import { inject, injectable } from 'inversify';
import { GenerateStudentCertificatesReportInput } from './generate-student-certificates-report.input';
import { GenerateStudentCertificatesReportOutput, CertificateData, CertificatesSummaryStats, CertificateTimeline, CourseCategoryStats } from './generate-student-certificates-report.output';
import type { CertificateRepository } from '../../../../certificate/infrastructure/repositories/CertificateRepository';
import type { CourseRepository } from '../../../../content/infrastructure/repositories/CourseRepository';
import type { EnrollmentRepository } from '../../../../enrollment/infrastructure/repositories/EnrollmentRepository';
import type { UserRepository } from '../../../../user/infrastructure/repositories/UserRepository';
import type { Certificate } from '../../../../certificate/core/entities/Certificate';
import { Register } from '../../../../../shared/container/symbols';

/**
 * Use case for generating student certificates report
 * Following CQRS pattern - direct repository queries for read operations
 * Following Clean Architecture and SOLID principles
 */
@injectable()
export class GenerateStudentCertificatesReportUseCase {
  constructor(
    @inject(Register.certificate.repository.CertificateRepository)
    private readonly certificateRepository: CertificateRepository,
    
    @inject(Register.content.repository.CourseRepository)
    private readonly courseRepository: CourseRepository,
    
    @inject(Register.enrollment.repository.EnrollmentRepository)
    private readonly enrollmentRepository: EnrollmentRepository,
    
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GenerateStudentCertificatesReportInput): Promise<GenerateStudentCertificatesReportOutput> {
    // Validate user exists and get user info
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all certificates for the user
    let certificates = await this.certificateRepository.listByUser(input.userId);
    
    // Filter by institution
    certificates = certificates.filter(cert => cert.institutionId === input.institutionId);

    // Apply filters
    certificates = this.applyFilters(certificates, input);

    // Build certificate data
    const certificateDataList: CertificateData[] = [];
    
    for (const certificate of certificates) {
      const certificateData = await this.buildCertificateData(certificate);
      certificateDataList.push(certificateData);
    }

    // Apply sorting
    this.applySorting(certificateDataList, input);

    // Calculate summary statistics
    const summary = this.calculateSummaryStats(certificateDataList);

    // Generate timeline analysis
    const timeline = this.generateTimeline(certificateDataList);

    // Generate category analysis
    const categoryStats = this.generateCategoryStats(certificateDataList);

    // Generate achievements
    const achievements = this.generateAchievements(certificateDataList);

    // Generate quick actions
    const quickActions = this.generateQuickActions(input.userId);

    return {
      generatedAt: new Date(),
      institutionId: input.institutionId,
      metadata: {
        reportType: 'StudentCertificatesReport',
        generatedAt: new Date(),
        dataSourcesUsed: ['Certificate', 'Course', 'Enrollment'],
        totalRecords: certificateDataList.length
      },
      studentId: input.userId,
      studentName: user.name,
      summary,
      certificates: certificateDataList,
      timeline,
      categoryStats,
      achievements,
      quickActions,
      filtersApplied: {
        courseId: input.courseId,
        dateRange: input.dateFrom && input.dateTo ? {
          from: input.dateFrom,
          to: input.dateTo
        } : undefined,
        sortBy: input.sortBy || 'issuedAt',
        sortOrder: input.sortOrder || 'desc'
      }
    };
  }

  private applyFilters(
    certificates: Certificate[],
    input: GenerateStudentCertificatesReportInput
  ): Certificate[] {
    let filtered = certificates;

    // Filter by course
    if (input.courseId) {
      filtered = filtered.filter(cert => cert.courseId === input.courseId);
    }

    // Filter by date range
    if (input.dateFrom) {
      filtered = filtered.filter(cert => cert.issuedAt >= (input.dateFrom ?? new Date(0)));
    }
    if (input.dateTo) {
      filtered = filtered.filter(cert => cert.issuedAt <= (input.dateTo ?? new Date()));
    }

    return filtered;
  }

  private async buildCertificateData(
    certificate: {
      id: string;
      userId: string;
      courseId: string;
      institutionId: string;
      issuedAt: Date;
      certificateNumber: string;
      certificateUrl: string;
    }
  ): Promise<CertificateData> {
    // Get course details
    const course = await this.courseRepository.findById(certificate.courseId);
    if (!course) {
      throw new Error(`Course not found: ${certificate.courseId}`);
    }

    // Get enrollment details
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(
      certificate.userId,
      certificate.courseId
    );
    if (!enrollment) {
      throw new Error(`Enrollment not found for user ${certificate.userId} and course ${certificate.courseId}`);
    }

    // Calculate time to complete
    const timeToComplete = Math.ceil(
      (certificate.issuedAt.getTime() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate validation URL
    const validationUrl = `/certificates/validate/${certificate.certificateNumber}`;

    return {
      certificateId: certificate.id,
      certificateNumber: certificate.certificateNumber,
      courseId: course.id,
      courseTitle: course.title,
      courseDescription: course.description,
      issuedAt: certificate.issuedAt,
      certificateUrl: certificate.certificateUrl,
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt || certificate.issuedAt,
      timeToComplete,
      isValid: true, // Assume all certificates are valid
      validationUrl,
      downloadUrl: certificate.certificateUrl,
      fileFormat: 'PDF'
    };
  }

  private applySorting(
    certificates: CertificateData[],
    input: GenerateStudentCertificatesReportInput
  ): void {
    const sortBy = input.sortBy || 'issuedAt';
    const sortOrder = input.sortOrder || 'desc';

    certificates.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'issuedAt':
          comparison = a.issuedAt.getTime() - b.issuedAt.getTime();
          break;
        case 'courseTitle':
          comparison = a.courseTitle.localeCompare(b.courseTitle);
          break;
        case 'certificateNumber':
          comparison = a.certificateNumber.localeCompare(b.certificateNumber);
          break;
        default:
          comparison = a.issuedAt.getTime() - b.issuedAt.getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private calculateSummaryStats(certificates: CertificateData[]): CertificatesSummaryStats {
    if (certificates.length === 0) {
      return {
        totalCertificates: 0,
        certificatesThisYear: 0,
        certificatesThisMonth: 0,
        averageTimeToComplete: 0,
        fastestCompletion: null,
        slowestCompletion: null,
        mostRecentCertificate: null,
        oldestCertificate: null
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const certificatesThisYear = certificates.filter(
      cert => cert.issuedAt.getFullYear() === currentYear
    ).length;

    const certificatesThisMonth = certificates.filter(
      cert => cert.issuedAt.getFullYear() === currentYear && 
              cert.issuedAt.getMonth() === currentMonth
    ).length;

    const averageTimeToComplete = certificates.reduce(
      (sum, cert) => sum + cert.timeToComplete, 0
    ) / certificates.length;

    const sortedByTime = [...certificates].sort((a, b) => a.timeToComplete - b.timeToComplete);
    const fastestCompletion = sortedByTime.length > 0 ? {
      courseTitle: sortedByTime[0].courseTitle,
      timeToComplete: sortedByTime[0].timeToComplete
    } : null;

    const slowestCompletion = sortedByTime.length > 0 ? {
      courseTitle: sortedByTime[sortedByTime.length - 1].courseTitle,
      timeToComplete: sortedByTime[sortedByTime.length - 1].timeToComplete
    } : null;

    const sortedByDate = [...certificates].sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
    const mostRecentCertificate = sortedByDate.length > 0 ? {
      courseTitle: sortedByDate[0].courseTitle,
      issuedAt: sortedByDate[0].issuedAt
    } : null;

    const oldestCertificate = sortedByDate.length > 0 ? {
      courseTitle: sortedByDate[sortedByDate.length - 1].courseTitle,
      issuedAt: sortedByDate[sortedByDate.length - 1].issuedAt
    } : null;

    return {
      totalCertificates: certificates.length,
      certificatesThisYear,
      certificatesThisMonth,
      averageTimeToComplete: Math.round(averageTimeToComplete * 100) / 100,
      fastestCompletion,
      slowestCompletion,
      mostRecentCertificate,
      oldestCertificate
    };
  }

  private generateTimeline(certificates: CertificateData[]): CertificateTimeline[] {
    // Group certificates by quarter
    const quarterlyData = new Map<string, CertificateData[]>();
    
    certificates.forEach(cert => {
      const year = cert.issuedAt.getFullYear();
      const quarter = Math.ceil((cert.issuedAt.getMonth() + 1) / 3);
      const quarterKey = `Q${quarter} ${year}`;
      
      if (!quarterlyData.has(quarterKey)) {
        quarterlyData.set(quarterKey, []);
      }
      quarterlyData.get(quarterKey)!.push(cert);
    });

    return Array.from(quarterlyData.entries())
      .map(([period, periodCertificates]) => ({
        period,
        certificatesCount: periodCertificates.length,
        courseTitles: periodCertificates.map(cert => cert.courseTitle)
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private generateCategoryStats(certificates: CertificateData[]): CourseCategoryStats[] {
    // For now, we'll create simple categories based on course titles
    // In a real implementation, courses would have category fields
    const categoryMap = new Map<string, CertificateData[]>();
    
    certificates.forEach(cert => {
      // Simple categorization based on keywords in course title
      let category = 'Outros';
      const title = cert.courseTitle.toLowerCase();
      
      if (title.includes('programação') || title.includes('desenvolvimento') || title.includes('código')) {
        category = 'Programação';
      } else if (title.includes('design') || title.includes('ui') || title.includes('ux')) {
        category = 'Design';
      } else if (title.includes('marketing') || title.includes('vendas')) {
        category = 'Marketing';
      } else if (title.includes('gestão') || title.includes('administração')) {
        category = 'Gestão';
      }
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(cert);
    });

    const totalCertificates = certificates.length;
    
    return Array.from(categoryMap.entries()).map(([category, categoryCertificates]) => ({
      category,
      certificatesCount: categoryCertificates.length,
      percentage: totalCertificates > 0 ? 
        Math.round((categoryCertificates.length / totalCertificates) * 100 * 100) / 100 : 0,
      courses: categoryCertificates.map(cert => cert.courseTitle)
    }));
  }

  private generateAchievements(certificates: CertificateData[]): {
    totalCoursesCompleted: number;
    certificatesPerYear: Record<string, number>;
    longestStreak: {
      startDate: Date;
      endDate: Date;
      certificatesCount: number;
    } | null;
    averageCertificatesPerMonth: number;
  } {
    const totalCoursesCompleted = certificates.length;
    
    // Group by year
    const certificatesPerYear: Record<string, number> = {};
    certificates.forEach(cert => {
      const year = cert.issuedAt.getFullYear().toString();
      certificatesPerYear[year] = (certificatesPerYear[year] || 0) + 1;
    });

    // Calculate longest streak (simplified - consecutive months with certificates)
    const sortedCerts = [...certificates].sort((a, b) => a.issuedAt.getTime() - b.issuedAt.getTime());
    let longestStreak: { startDate: Date; endDate: Date; certificatesCount: number } | null = null;
    
    if (sortedCerts.length > 0) {
      // Simplified streak calculation
      longestStreak = {
        startDate: sortedCerts[0].issuedAt,
        endDate: sortedCerts[sortedCerts.length - 1].issuedAt,
        certificatesCount: sortedCerts.length
      };
    }

    // Calculate average certificates per month
    const averageCertificatesPerMonth = certificates.length > 0 ? 
      certificates.length / Math.max(1, this.getMonthsDifference(sortedCerts)) : 0;

    return {
      totalCoursesCompleted,
      certificatesPerYear,
      longestStreak,
      averageCertificatesPerMonth: Math.round(averageCertificatesPerMonth * 100) / 100
    };
  }

  private getMonthsDifference(certificates: CertificateData[]): number {
    if (certificates.length === 0) return 1;
    
    const oldest = certificates[0].issuedAt;
    const newest = certificates[certificates.length - 1].issuedAt;
    
    const yearDiff = newest.getFullYear() - oldest.getFullYear();
    const monthDiff = newest.getMonth() - oldest.getMonth();
    
    return Math.max(1, yearDiff * 12 + monthDiff + 1);
  }

  private generateQuickActions(userId: string): {
    downloadAllUrl?: string;
    shareProfileUrl?: string;
    printFriendlyUrl?: string;
  } {
    return {
      downloadAllUrl: `/api/certificates/download-all/${userId}`,
      shareProfileUrl: `/profile/${userId}/certificates`,
      printFriendlyUrl: `/certificates/print/${userId}`
    };
  }
}
