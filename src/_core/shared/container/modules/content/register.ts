import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import implementations
import type { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { FirebaseContentRepository } from '@/_core/modules/content/infrastructure/repositories/implementations/FirebaseContentRepository';
import { CreateContentUseCase } from '@/_core/modules/content/core/use-cases/create-content/create-content.use-case';
import { CreateCourseUseCase } from '@/_core/modules/content/core/use-cases/create-course/create-course.use-case';
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case';
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
  
  // Register use cases
  container.bind(useCases.CreateContentUseCase).to(CreateContentUseCase);
  container.bind(useCases.CreateCourseUseCase).to(CreateCourseUseCase);
  container.bind(useCases.UpdateCourseUseCase).to(UpdateCourseUseCase);
  // container.bind(useCases.ListContentsUseCase).to(ListContentsUseCase);
}
