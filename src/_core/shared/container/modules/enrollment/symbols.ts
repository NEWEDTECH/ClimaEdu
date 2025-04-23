// Enrollment module symbols
export const repositories = {
  EnrollmentRepository: Symbol.for('EnrollmentRepository'),
};

export const useCases = {
  EnrollInCourseUseCase: Symbol.for('EnrollInCourseUseCase'),
  CancelEnrollmentUseCase: Symbol.for('CancelEnrollmentUseCase'),
};

// Export all symbols for this module
export const EnrollmentSymbols = {
  repositories,
  useCases,
};
