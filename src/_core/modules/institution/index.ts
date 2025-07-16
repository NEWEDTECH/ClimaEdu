/**
 * Export all entities and use cases from the institution module
 */
export * from './core/entities';
export { UserInstitution } from './core/entities/UserInstitution';

// Export use cases
export { CreateInstitutionUseCase } from './core/use-cases/create-institution/create-institution.use-case';
export type { CreateInstitutionInput } from './core/use-cases/create-institution/create-institution.input';
export type { CreateInstitutionOutput } from './core/use-cases/create-institution/create-institution.output';
export { UpdateInstitutionSettingsUseCase } from './core/use-cases/update-institution-settings/update-institution-settings.use-case';
export type { UpdateInstitutionSettingsInput } from './core/use-cases/update-institution-settings/update-institution-settings.input';
export type { UpdateInstitutionSettingsOutput } from './core/use-cases/update-institution-settings/update-institution-settings.output';
export { AssociateUserToInstitutionUseCase } from './core/use-cases/associate-user-to-institution/associate-user-to-institution.use-case';
export type { AssociateUserToInstitutionInput } from './core/use-cases/associate-user-to-institution/associate-user-to-institution.input';
export type { AssociateUserToInstitutionOutput } from './core/use-cases/associate-user-to-institution/associate-user-to-institution.output';
export { ListInstitutionsUseCase } from './core/use-cases/list-institutions/list-institutions.use-case';
export type { ListInstitutionsInput } from './core/use-cases/list-institutions/list-institutions.input';
export type { ListInstitutionsOutput } from './core/use-cases/list-institutions/list-institutions.output';
export { ListUserInstitutionsUseCase } from './core/use-cases/list-user-institutions/list-user-institutions.use-case';
export type { ListUserInstitutionsInput } from './core/use-cases/list-user-institutions/list-user-institutions.input';
export type { ListUserInstitutionsOutput } from './core/use-cases/list-user-institutions/list-user-institutions.output';

// Export repository interfaces
export type { InstitutionRepository } from './infrastructure/repositories/InstitutionRepository';
export type { UserInstitutionRepository } from './infrastructure/repositories/UserInstitutionRepository';

// Export repository implementations
export { FirebaseInstitutionRepository } from './infrastructure/repositories/implementations/FirebaseInstitutionRepository';
export { FirebaseUserInstitutionRepository } from './infrastructure/repositories/implementations/FirebaseUserInstitutionRepository';
