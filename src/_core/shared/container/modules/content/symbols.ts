// Content module symbols
export const repositories = {
  ContentRepository: Symbol.for('ContentRepository'),
  CourseRepository: Symbol.for('CourseRepository'),
  ModuleRepository: Symbol.for('ModuleRepository'),
};

export const useCases = {
  CreateContentUseCase: Symbol.for('CreateContentUseCase'),
  ListContentsUseCase: Symbol.for('ListContentsUseCase'),
  CreateCourseUseCase: Symbol.for('CreateCourseUseCase'),
  UpdateCourseUseCase: Symbol.for('UpdateCourseUseCase'),
  CreateModuleUseCase: Symbol.for('CreateModuleUseCase'),
};

// Export all symbols for this module
export const ContentSymbols = {
  repositories,
  useCases,
};
