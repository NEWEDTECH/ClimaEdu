// Enrollment module symbols
export const repositories = {
  EnrollmentRepository: Symbol.for('EnrollmentRepository'),
  ClassRepository: Symbol.for('ClassRepository'),
};

export const useCases = {
  EnrollInCourseUseCase: Symbol.for('EnrollInCourseUseCase'),
  CancelEnrollmentUseCase: Symbol.for('CancelEnrollmentUseCase'),
  ListEnrollmentsUseCase: Symbol.for('ListEnrollmentsUseCase'),
  CreateClassUseCase: Symbol.for('CreateClassUseCase'),
  UpdateClassUseCase: Symbol.for('UpdateClassUseCase'),
  GetClassUseCase: Symbol.for('GetClassUseCase'),
  ListClassesUseCase: Symbol.for('ListClassesUseCase'),
  DeleteClassUseCase: Symbol.for('DeleteClassUseCase'),
  AddEnrollmentToClassUseCase: Symbol.for('AddEnrollmentToClassUseCase'),
  RemoveEnrollmentFromClassUseCase: Symbol.for(
    'RemoveEnrollmentFromClassUseCase'
  ),
  EnrollInTrailUseCase: Symbol.for('EnrollInTrailUseCase'),
  CompleteCourseUseCase: Symbol.for('CompleteCourseUseCase'),
};

// Export all symbols for this module
export const EnrollmentSymbols = {
  repositories,
  useCases,
};
