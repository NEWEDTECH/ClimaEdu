// Content module symbols
export const repositories = {
  ContentRepository: Symbol.for('ContentRepository'),
  CourseRepository: Symbol.for('CourseRepository'),
  CourseTutorRepository: Symbol.for('CourseTutorRepository'),
  ModuleRepository: Symbol.for('ModuleRepository'),
  LessonRepository: Symbol.for('LessonRepository'),
  ActivityRepository: Symbol.for('ActivityRepository'),
  QuestionnaireRepository: Symbol.for('QuestionnaireRepository'),
  QuestionnaireSubmissionRepository: Symbol.for('QuestionnaireSubmissionRepository'),
};

export const useCases = {
  CreateContentUseCase: Symbol.for('CreateContentUseCase'),
  ListContentsUseCase: Symbol.for('ListContentsUseCase'),
  CreateCourseUseCase: Symbol.for('CreateCourseUseCase'),
  UpdateCourseUseCase: Symbol.for('UpdateCourseUseCase'),
  CreateModuleUseCase: Symbol.for('CreateModuleUseCase'),
  CreateLessonUseCase: Symbol.for('CreateLessonUseCase'),
  AddContentToLessonUseCase: Symbol.for('AddContentToLessonUseCase'),
  CreateActivityUseCase: Symbol.for('CreateActivityUseCase'),
  CreateQuestionnaireUseCase: Symbol.for('CreateQuestionnaireUseCase'),
  AddQuestionToQuestionnaireUseCase: Symbol.for('AddQuestionToQuestionnaireUseCase'),
  UpdateQuestionUseCase: Symbol.for('UpdateQuestionUseCase'),
  DeleteQuestionUseCase: Symbol.for('DeleteQuestionUseCase'),
  ListQuestionsOfQuestionnaireUseCase: Symbol.for('ListQuestionsOfQuestionnaireUseCase'),
  SubmitQuestionnaireUseCase: Symbol.for('SubmitQuestionnaireUseCase'),
  RetryQuestionnaireUseCase: Symbol.for('RetryQuestionnaireUseCase'),
  AssociateTutorToCourseUseCase: Symbol.for('AssociateTutorToCourseUseCase'),
  ListTutorCoursesUseCase: Symbol.for('ListTutorCoursesUseCase'),
};

// Export all symbols for this module
export const ContentSymbols = {
  repositories,
  useCases,
};
