/**
 * Export all components from the Report module
 * Following Clean Architecture principles
 */

// Interfaces
export * from './core/interfaces/BaseReportDTO';

// Symbols
export * from './core/symbols/ReportSymbols';

// Use Cases - Student Reports
export * from './core/use-cases/generate-student-course-progress-report';
export * from './core/use-cases/generate-student-assessment-performance-report';
export * from './core/use-cases/generate-student-certificates-report';
export * from './core/use-cases/generate-student-study-habits-report';
export * from './core/use-cases/generate-student-badges-report';
export * from './core/use-cases/generate-student-class-comparison-report';

// Use Cases - Tutor Reports
export * from './core/use-cases/generate-class-overview-report';
export * from './core/use-cases/generate-individual-student-report';
export * from './core/use-cases/generate-class-assessment-performance-report';
export * from './core/use-cases/generate-engagement-retention-report';

// Use Cases - Institution Reports
export * from './core/use-cases/generate-course-dashboard-report';
export * from './core/use-cases/generate-retention-analysis-report';
export * from './core/use-cases/generate-quality-report';
