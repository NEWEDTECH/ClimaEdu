/**
 * Dependency Injection symbols for Report module
 * Following Clean Architecture and SOLID principles
 */

// Student Report Use Cases
export const STUDENT_COURSE_PROGRESS_REPORT_USE_CASE = Symbol('StudentCourseProgressReportUseCase');
export const STUDENT_ASSESSMENT_PERFORMANCE_REPORT_USE_CASE = Symbol('StudentAssessmentPerformanceReportUseCase');
export const STUDENT_CERTIFICATES_REPORT_USE_CASE = Symbol('StudentCertificatesReportUseCase');
export const STUDENT_STUDY_HABITS_REPORT_USE_CASE = Symbol('StudentStudyHabitsReportUseCase');
export const STUDENT_BADGES_REPORT_USE_CASE = Symbol('StudentBadgesReportUseCase');

// Tutor Report Use Cases
export const CLASS_OVERVIEW_REPORT_USE_CASE = Symbol('ClassOverviewReportUseCase');
export const INDIVIDUAL_STUDENT_TRACKING_REPORT_USE_CASE = Symbol('IndividualStudentTrackingReportUseCase');
export const CLASS_ASSESSMENT_PERFORMANCE_REPORT_USE_CASE = Symbol('ClassAssessmentPerformanceReportUseCase');
export const STUDENT_ENGAGEMENT_RETENTION_REPORT_USE_CASE = Symbol('StudentEngagementRetentionReportUseCase');

// Institution Report Use Cases
export const COURSE_DASHBOARD_REPORT_USE_CASE = Symbol('CourseDashboardReportUseCase');
export const RETENTION_ANALYSIS_REPORT_USE_CASE = Symbol('RetentionAnalysisReportUseCase');
export const GENERAL_ENGAGEMENT_REPORT_USE_CASE = Symbol('GeneralEngagementReportUseCase');
export const EDUCATIONAL_PERFORMANCE_REPORT_USE_CASE = Symbol('EducationalPerformanceReportUseCase');
export const TUTOR_PERFORMANCE_REPORT_USE_CASE = Symbol('TutorPerformanceReportUseCase');
export const QUALITY_REPORT_USE_CASE = Symbol('QualityReportUseCase');
