import { Container } from 'inversify';
import { useCases, repositories } from './symbols';

// Import implementations
import type { BadgeRepository } from '@/_core/modules/badge/infrastructure/repositories/BadgeRepository';
import type { StudentBadgeRepository } from '@/_core/modules/badge/infrastructure/repositories/StudentBadgeRepository';
import { FirebaseBadgeRepository } from '@/_core/modules/badge/infrastructure/repositories/implementations/FirebaseBadgeRepository';
import { FirebaseStudentBadgeRepository } from '@/_core/modules/badge/infrastructure/repositories/implementations/FirebaseStudentBadgeRepository';
import { ViewEarnedBadgesUseCase } from '@/_core/modules/badge/core/use-cases/view-earned-badges/view-earned-badges.use-case';

/**
 * Register Badge module dependencies
 * @param container The DI container
 */
export function registerBadgeModule(container: Container): void {
  // Register repositories
  container.bind<BadgeRepository>(repositories.BadgeRepository).to(FirebaseBadgeRepository);
  container.bind<StudentBadgeRepository>(repositories.StudentBadgeRepository).to(FirebaseStudentBadgeRepository);
  
  // Register use cases
  container.bind(useCases.ViewEarnedBadgesUseCase).to(ViewEarnedBadgesUseCase);
}
