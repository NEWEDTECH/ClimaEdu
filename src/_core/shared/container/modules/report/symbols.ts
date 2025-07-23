// Report module symbols
export const repositories = {
  // Reports don't have repositories - they use CQRS pattern with direct queries
};

export const useCases = {
  // Student Reports
  GenerateStudentCourseProgressReportUseCase: Symbol.for('GenerateStudentCourseProgressReportUseCase'),
  GenerateStudentAssessmentPerformanceReportUseCase: Symbol.for('GenerateStudentAssessmentPerformanceReportUseCase'),
  GenerateStudentCertificatesReportUseCase: Symbol.for('GenerateStudentCertificatesReportUseCase'),
  GenerateStudentStudyHabitsReportUseCase: Symbol.for('GenerateStudentStudyHabitsReportUseCase'),
  GenerateStudentBadgesReportUseCase: Symbol.for('GenerateStudentBadgesReportUseCase'),
  
  // Tutor Reports
  GenerateClassOverviewReportUseCase: Symbol.for('GenerateClassOverviewReportUseCase'),
  GenerateIndividualStudentTrackingReportUseCase: Symbol.for('GenerateIndividualStudentTrackingReportUseCase'),
  GenerateClassAssessmentPerformanceReportUseCase: Symbol.for('GenerateClassAssessmentPerformanceReportUseCase'),
  GenerateStudentEngagementRetentionReportUseCase: Symbol.for('GenerateStudentEngagementRetentionReportUseCase'),
  
  // Institution Reports
  GenerateCourseDashboardReportUseCase: Symbol.for('GenerateCourseDashboardReportUseCase'),
  GenerateRetentionAnalysisReportUseCase: Symbol.for('GenerateRetentionAnalysisReportUseCase'),
  GenerateGeneralEngagementReportUseCase: Symbol.for('GenerateGeneralEngagementReportUseCase'),
  GenerateEducationalPerformanceReportUseCase: Symbol.for('GenerateEducationalPerformanceReportUseCase'),
  GenerateTutorPerformanceReportUseCase: Symbol.for('GenerateTutorPerformanceReportUseCase'),
};

// Export all symbols for this module
export const ReportSymbols = {
  repositories,
  useCases,
};
