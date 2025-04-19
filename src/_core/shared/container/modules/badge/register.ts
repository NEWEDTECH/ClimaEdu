import { Container } from 'inversify';
import { useCases } from './symbols';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { repositories } from './symbols';

// Import implementations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { BadgeRepository } from '@/_core/modules/badge/infrastructure/repositories/BadgeRepository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { StudentBadgeRepository } from '@/_core/modules/badge/infrastructure/repositories/StudentBadgeRepository';
import { ViewEarnedBadgesUseCase } from '@/_core/modules/badge/core/use-cases/view-earned-badges/view-earned-badges.use-case';

/**
 * Register Badge module dependencies
 * @param container The DI container
 */
export function registerBadgeModule(container: Container): void {
  // Register repositories
  // TODO: Implement and register FirebaseBadgeRepository
  // container.bind<BadgeRepository>(repositories.BadgeRepository).to(FirebaseBadgeRepository);
  // TODO: Implement and register FirebaseStudentBadgeRepository
  // container.bind<StudentBadgeRepository>(repositories.StudentBadgeRepository).to(FirebaseStudentBadgeRepository);
  
  // Register use cases
  container.bind(useCases.ViewEarnedBadgesUseCase).to(ViewEarnedBadgesUseCase);
}
