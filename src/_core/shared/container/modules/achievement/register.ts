import { Container } from 'inversify';
import { useCases, repositories } from './symbols';

// Import implementations
import type { InstitutionAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/InstitutionAchievementRepository';
import type { DefaultAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/DefaultAchievementRepository';
import type { StudentAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/StudentAchievementRepository';
import { FirebaseInstitutionAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/implementations/FirebaseInstitutionAchievementRepository';
import { FirebaseDefaultAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/implementations/FirebaseDefaultAchievementRepository';
import { FirebaseStudentAchievementRepository } from '@/_core/modules/achievement/infrastructure/repositories/implementations/FirebaseStudentAchievementRepository';
import { CreateInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/create-institution-achievement/create-institution-achievement.use-case';
import { UpdateInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/update-institution-achievement/update-institution-achievement.use-case';
import { DeleteInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/delete-institution-achievement/delete-institution-achievement.use-case';
import { ListInstitutionAchievementsUseCase } from '@/_core/modules/achievement/core/use-cases/list-institution-achievements/list-institution-achievements.use-case';
import { GetInstitutionAchievementUseCase } from '@/_core/modules/achievement/core/use-cases/get-institution-achievement/get-institution-achievement.use-case';
import { ListStudentAchievementsUseCase } from '@/_core/modules/achievement/core/use-cases/list-student-achievements/list-student-achievements.use-case';

/**
 * Register Achievement module dependencies
 * @param container The DI container
 */
export function registerAchievementModule(container: Container): void {
  // Register repositories
  container.bind<InstitutionAchievementRepository>(repositories.InstitutionAchievementRepository).to(FirebaseInstitutionAchievementRepository);
  container.bind<DefaultAchievementRepository>(repositories.DefaultAchievementRepository).to(FirebaseDefaultAchievementRepository);
  container.bind<StudentAchievementRepository>(repositories.StudentAchievementRepository).to(FirebaseStudentAchievementRepository);
  
  // Register use cases
  container.bind(useCases.CreateInstitutionAchievementUseCase).to(CreateInstitutionAchievementUseCase);
  container.bind(useCases.UpdateInstitutionAchievementUseCase).to(UpdateInstitutionAchievementUseCase);
  container.bind(useCases.DeleteInstitutionAchievementUseCase).to(DeleteInstitutionAchievementUseCase);
  container.bind(useCases.ListInstitutionAchievementsUseCase).to(ListInstitutionAchievementsUseCase);
  container.bind(useCases.GetInstitutionAchievementUseCase).to(GetInstitutionAchievementUseCase);
  container.bind(useCases.ListStudentAchievementsUseCase).to(ListStudentAchievementsUseCase);
}