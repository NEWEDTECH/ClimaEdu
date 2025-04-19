import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import implementations
import type { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository';
import { FirebaseContentRepository } from '@/_core/modules/content/infrastructure/repositories/implementations/FirebaseContentRepository';
import { CreateContentUseCase } from '@/_core/modules/content/core/use-cases/create-content/create-content.use-case';
// import { ListContentsUseCase } from '@/_core/modules/content/core/use-cases/list-contents/list-contents.use-case';

/**
 * Register Content module dependencies
 * @param container The DI container
 */
export function registerContentModule(container: Container): void {
  // Register repositories
  container.bind<ContentRepository>(repositories.ContentRepository).to(FirebaseContentRepository);
  
  // Register use cases
  container.bind(useCases.CreateContentUseCase).to(CreateContentUseCase);
  // container.bind(useCases.ListContentsUseCase).to(ListContentsUseCase);
}
