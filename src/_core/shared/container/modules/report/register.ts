import { Container } from 'inversify';
import { ReportSymbols } from './symbols';

// Student Reports
import { GenerateStudentAssessmentPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-assessment-performance-report';
import { GenerateStudentBadgesReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-badges-report';
import { GenerateStudentCertificatesReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-certificates-report';
import { GenerateStudentCourseProgressReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-course-progress-report';
import { GenerateStudentStudyHabitsReportUseCase } from '@/_core/modules/report/core/use-cases/generate-student-study-habits-report';

// Tutor Reports
import { GenerateClassAssessmentPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-class-assessment-performance-report';
import { GenerateClassOverviewReportUseCase } from '@/_core/modules/report/core/use-cases/generate-class-overview-report';
import { GenerateIndividualStudentReportUseCase } from '@/_core/modules/report/core/use-cases/generate-individual-student-report';
import { GenerateEngagementRetentionReportUseCase } from '@/_core/modules/report/core/use-cases/generate-engagement-retention-report';

// Institution Reports
import { GenerateCourseDashboardReportUseCase } from '@/_core/modules/report/core/use-cases/generate-course-dashboard-report';
import { GenerateRetentionAnalysisReportUseCase } from '@/_core/modules/report/core/use-cases/generate-retention-analysis-report';

// These might not exist, add them if they do
// import { GenerateGeneralEngagementReportUseCase } from '@/_core/modules/report/core/use-cases/generate-general-engagement-report';
// import { GenerateEducationalPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-educational-performance-report';
// import { GenerateTutorPerformanceReportUseCase } from '@/_core/modules/report/core/use-cases/generate-tutor-performance-report';


export function registerReportModule(container: Container): void {
  // Student Reports
  container.bind(ReportSymbols.useCases.GenerateStudentAssessmentPerformanceReportUseCase).to(GenerateStudentAssessmentPerformanceReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateStudentBadgesReportUseCase).to(GenerateStudentBadgesReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateStudentCertificatesReportUseCase).to(GenerateStudentCertificatesReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateStudentCourseProgressReportUseCase).to(GenerateStudentCourseProgressReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateStudentStudyHabitsReportUseCase).to(GenerateStudentStudyHabitsReportUseCase);

  // Tutor Reports
  container.bind(ReportSymbols.useCases.GenerateClassAssessmentPerformanceReportUseCase).to(GenerateClassAssessmentPerformanceReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateClassOverviewReportUseCase).to(GenerateClassOverviewReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateIndividualStudentTrackingReportUseCase).to(GenerateIndividualStudentReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateStudentEngagementRetentionReportUseCase).to(GenerateEngagementRetentionReportUseCase);

  // Institution Reports
  container.bind(ReportSymbols.useCases.GenerateCourseDashboardReportUseCase).to(GenerateCourseDashboardReportUseCase);
  container.bind(ReportSymbols.useCases.GenerateRetentionAnalysisReportUseCase).to(GenerateRetentionAnalysisReportUseCase);

  // Bind these if they exist and are needed
  // container.bind(ReportSymbols.useCases.GenerateGeneralEngagementReportUseCase).to(GenerateGeneralEngagementReportUseCase);
  // container.bind(ReportSymbols.useCases.GenerateEducationalPerformanceReportUseCase).to(GenerateEducationalPerformanceReportUseCase);
  // container.bind(ReportSymbols.useCases.GenerateTutorPerformanceReportUseCase).to(GenerateTutorPerformanceReportUseCase);
}
