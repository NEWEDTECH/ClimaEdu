// This file serves as the public API for the Enrollment module

// Re-export entities
export * from './core/entities/Enrollment';
export * from './core/entities/EnrollmentStatus';

// Re-export use cases
export * from './core/use-cases/enroll-in-course/enroll-in-course.use-case';
export * from './core/use-cases/enroll-in-course/enroll-in-course.input';
export * from './core/use-cases/enroll-in-course/enroll-in-course.output';
export * from './core/use-cases/cancel-enrollment/cancel-enrollment.use-case';
export * from './core/use-cases/cancel-enrollment/cancel-enrollment.input';
export * from './core/use-cases/cancel-enrollment/cancel-enrollment.output';

// Re-export repository interfaces
export * from './infrastructure/repositories/EnrollmentRepository';

// Re-export repository implementations
// TODO: Implement and export FirebaseEnrollmentRepository
