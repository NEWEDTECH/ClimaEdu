import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import implementations
import { CreateInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/create-institution/create-institution.use-case';
import { UpdateInstitutionSettingsUseCase } from '@/_core/modules/institution/core/use-cases/update-institution-settings/update-institution-settings.use-case';
import { AssociateUserToInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/associate-user-to-institution/associate-user-to-institution.use-case';
import { AssociateAdministratorUseCase } from '@/_core/modules/institution/core/use-cases/associate-administrator/associate-administrator.use-case';
import type { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
import type { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository';
import { FirebaseInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/implementations/FirebaseInstitutionRepository';
import { FirebaseUserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/implementations/FirebaseUserInstitutionRepository';

/**
 * Register Institution module dependencies
 * @param container The DI container
 */
export function registerInstitutionModule(container: Container): void {
  // Register repositories
  container.bind<InstitutionRepository>(repositories.InstitutionRepository).to(FirebaseInstitutionRepository);
  container.bind<UserInstitutionRepository>(repositories.UserInstitutionRepository).to(FirebaseUserInstitutionRepository);
  
  // Register use cases
  container.bind(useCases.CreateInstitutionUseCase).to(CreateInstitutionUseCase);
  container.bind(useCases.UpdateInstitutionSettingsUseCase).to(UpdateInstitutionSettingsUseCase);
  container.bind(useCases.AssociateUserToInstitutionUseCase).to(AssociateUserToInstitutionUseCase);
  container.bind(useCases.AssociateAdministratorUseCase).to(AssociateAdministratorUseCase);
}
