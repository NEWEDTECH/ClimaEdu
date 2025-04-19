import { Container } from 'inversify';
// We keep repositories import even though it's not used yet, as it will be needed when repository implementation is added
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { repositories, useCases } from './symbols';

// Import implementations
import { CreateInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/create-institution/create-institution.use-case';
import { UpdateInstitutionSettingsUseCase } from '@/_core/modules/institution/core/use-cases/update-institution-settings/update-institution-settings.use-case';
// import type { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
// import { FirebaseInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/implementations/FirebaseInstitutionRepository';

/**
 * Register Institution module dependencies
 * @param container The DI container
 */
export function registerInstitutionModule(container: Container): void {
  // Register repositories
  // Uncomment when FirebaseInstitutionRepository is implemented
  // container.bind<InstitutionRepository>(repositories.InstitutionRepository).to(FirebaseInstitutionRepository);
  
  // Register use cases
  container.bind(useCases.CreateInstitutionUseCase).to(CreateInstitutionUseCase);
  container.bind(useCases.UpdateInstitutionSettingsUseCase).to(UpdateInstitutionSettingsUseCase);
}
