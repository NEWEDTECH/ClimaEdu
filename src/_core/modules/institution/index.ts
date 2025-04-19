/**
 * Export all entities and use cases from the institution module
 */
export * from './core/entities';

// Export use cases
export { CreateInstitutionUseCase } from './core/use-cases/create-institution/create-institution.use-case';
export type { CreateInstitutionInput } from './core/use-cases/create-institution/create-institution.input';
export type { CreateInstitutionOutput } from './core/use-cases/create-institution/create-institution.output';
export { UpdateInstitutionSettingsUseCase } from './core/use-cases/update-institution-settings/update-institution-settings.use-case';
export type { UpdateInstitutionSettingsInput } from './core/use-cases/update-institution-settings/update-institution-settings.input';
export type { UpdateInstitutionSettingsOutput } from './core/use-cases/update-institution-settings/update-institution-settings.output';

// Export repository interfaces
export type { InstitutionRepository } from './infrastructure/repositories/InstitutionRepository';
