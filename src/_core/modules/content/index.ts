// This file serves as the public API for the Content module

// Re-export entities
export * from './core/entities/Content';
export * from './core/entities/Course';
export * from './core/entities/Module';
export * from './core/entities/Lesson';
export * from './core/entities/Activity';
export * from './core/entities/Questionnaire';
export * from './core/entities/Question';

// Re-export use cases
export * from './core/use-cases/create-content/create-content.use-case';
export * from './core/use-cases/create-content/create-content.input';
export * from './core/use-cases/create-content/create-content.output';
export * from './core/use-cases/create-course/create-course.use-case';
export * from './core/use-cases/create-course/create-course.input';
export * from './core/use-cases/create-course/create-course.output';
export * from './core/use-cases/update-course/update-course.use-case';
export * from './core/use-cases/update-course/update-course.input';
export * from './core/use-cases/update-course/update-course.output';
export * from './core/use-cases/create-module/create-module.use-case';
export * from './core/use-cases/create-module/create-module.input';
export * from './core/use-cases/create-module/create-module.output';
export * from './core/use-cases/create-lesson/create-lesson.use-case';
export * from './core/use-cases/create-lesson/create-lesson.input';
export * from './core/use-cases/create-lesson/create-lesson.output';
export * from './core/use-cases/add-content-to-lesson/add-content-to-lesson.use-case';
export * from './core/use-cases/add-content-to-lesson/add-content-to-lesson.input';
export * from './core/use-cases/add-content-to-lesson/add-content-to-lesson.output';
export * from './core/use-cases/create-activity/create-activity.use-case';
export * from './core/use-cases/create-activity/create-activity.input';
export * from './core/use-cases/create-activity/create-activity.output';
export * from './core/use-cases/create-questionnaire/create-questionnaire.use-case';
export * from './core/use-cases/create-questionnaire/create-questionnaire.input';
export * from './core/use-cases/create-questionnaire/create-questionnaire.output';
export * from './core/use-cases/add-question-to-questionnaire/add-question-to-questionnaire.use-case';
export * from './core/use-cases/add-question-to-questionnaire/add-question-to-questionnaire.input';
export * from './core/use-cases/add-question-to-questionnaire/add-question-to-questionnaire.output';
export * from './core/use-cases/update-question/update-question.use-case';
export * from './core/use-cases/update-question/update-question.input';
export * from './core/use-cases/update-question/update-question.output';
export * from './core/use-cases/delete-question/delete-question.use-case';
export * from './core/use-cases/delete-question/delete-question.input';
export * from './core/use-cases/delete-question/delete-question.output';
export * from './core/use-cases/list-questions-of-questionnaire/list-questions-of-questionnaire.use-case';
export * from './core/use-cases/list-questions-of-questionnaire/list-questions-of-questionnaire.input';
export * from './core/use-cases/list-questions-of-questionnaire/list-questions-of-questionnaire.output';
// export * from './core/use-cases/list-contents/list-contents.use-case';

// Re-export repository interfaces
export * from './infrastructure/repositories/ContentRepository';
export * from './infrastructure/repositories/CourseRepository';
export * from './infrastructure/repositories/ModuleRepository';
export * from './infrastructure/repositories/LessonRepository';
export * from './infrastructure/repositories/ActivityRepository';
export * from './infrastructure/repositories/QuestionnaireRepository';

// Re-export repository implementations
export * from './infrastructure/repositories/implementations/FirebaseContentRepository';
