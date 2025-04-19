import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import implementations
import type { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ActivityRepository } from '@/_core/modules/content/infrastructure/repositories/ActivityRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { QuestionnaireRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { QuestionnaireSubmissionRepository } from '@/_core/modules/content/infrastructure/repositories/QuestionnaireSubmissionRepository';
import { FirebaseContentRepository } from '@/_core/modules/content/infrastructure/repositories/implementations/FirebaseContentRepository';
import { CreateContentUseCase } from '@/_core/modules/content/core/use-cases/create-content/create-content.use-case';
import { CreateCourseUseCase } from '@/_core/modules/content/core/use-cases/create-course/create-course.use-case';
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case';
import { CreateModuleUseCase } from '@/_core/modules/content/core/use-cases/create-module/create-module.use-case';
import { CreateLessonUseCase } from '@/_core/modules/content/core/use-cases/create-lesson/create-lesson.use-case';
import { AddContentToLessonUseCase } from '@/_core/modules/content/core/use-cases/add-content-to-lesson/add-content-to-lesson.use-case';
import { CreateActivityUseCase } from '@/_core/modules/content/core/use-cases/create-activity/create-activity.use-case';
import { CreateQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/create-questionnaire/create-questionnaire.use-case';
import { AddQuestionToQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/add-question-to-questionnaire/add-question-to-questionnaire.use-case';
import { UpdateQuestionUseCase } from '@/_core/modules/content/core/use-cases/update-question/update-question.use-case';
import { DeleteQuestionUseCase } from '@/_core/modules/content/core/use-cases/delete-question/delete-question.use-case';
import { ListQuestionsOfQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/list-questions-of-questionnaire/list-questions-of-questionnaire.use-case';
import { SubmitQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/submit-questionnaire/submit-questionnaire.use-case';
import { RetryQuestionnaireUseCase } from '@/_core/modules/content/core/use-cases/retry-questionnaire/retry-questionnaire.use-case';
// import { ListContentsUseCase } from '@/_core/modules/content/core/use-cases/list-contents/list-contents.use-case';

/**
 * Register Content module dependencies
 * @param container The DI container
 */
export function registerContentModule(container: Container): void {
  // Register repositories
  container.bind<ContentRepository>(repositories.ContentRepository).to(FirebaseContentRepository);
  // TODO: Implement and register FirebaseCourseRepository
  // container.bind<CourseRepository>(repositories.CourseRepository).to(FirebaseCourseRepository);
  // TODO: Implement and register FirebaseModuleRepository
  // container.bind<ModuleRepository>(repositories.ModuleRepository).to(FirebaseModuleRepository);
  // TODO: Implement and register FirebaseLessonRepository
  // container.bind<LessonRepository>(repositories.LessonRepository).to(FirebaseLessonRepository);
  // TODO: Implement and register FirebaseActivityRepository
  // container.bind<ActivityRepository>(repositories.ActivityRepository).to(FirebaseActivityRepository);
  // TODO: Implement and register FirebaseQuestionnaireRepository
  // container.bind<QuestionnaireRepository>(repositories.QuestionnaireRepository).to(FirebaseQuestionnaireRepository);
  
  // Register use cases
  container.bind(useCases.CreateContentUseCase).to(CreateContentUseCase);
  container.bind(useCases.CreateCourseUseCase).to(CreateCourseUseCase);
  container.bind(useCases.UpdateCourseUseCase).to(UpdateCourseUseCase);
  container.bind(useCases.CreateModuleUseCase).to(CreateModuleUseCase);
  container.bind(useCases.CreateLessonUseCase).to(CreateLessonUseCase);
  container.bind(useCases.AddContentToLessonUseCase).to(AddContentToLessonUseCase);
  container.bind(useCases.CreateActivityUseCase).to(CreateActivityUseCase);
  container.bind(useCases.CreateQuestionnaireUseCase).to(CreateQuestionnaireUseCase);
  container.bind(useCases.AddQuestionToQuestionnaireUseCase).to(AddQuestionToQuestionnaireUseCase);
  container.bind(useCases.UpdateQuestionUseCase).to(UpdateQuestionUseCase);
  container.bind(useCases.DeleteQuestionUseCase).to(DeleteQuestionUseCase);
  container.bind(useCases.ListQuestionsOfQuestionnaireUseCase).to(ListQuestionsOfQuestionnaireUseCase);
  container.bind(useCases.SubmitQuestionnaireUseCase).to(SubmitQuestionnaireUseCase);
  container.bind(useCases.RetryQuestionnaireUseCase).to(RetryQuestionnaireUseCase);
  // container.bind(useCases.ListContentsUseCase).to(ListContentsUseCase);
}
