/**
 * Export all entities and use cases from the institution module
 */
export * from './core/entities';

// Export use cases
export { CreateInstitutionUseCase } from './core/use-cases/create-institution/create-institution.use-case';
export type { CreateInstitutionInput } from './core/use-cases/create-institution/create-institution.input';
export type { CreateInstitutionOutput } from './core/use-cases/create-institution/create-institution.output';

// Export repository interfaces
export type { InstitutionRepository, CreateInstitutionDTO } from './infrastructure/repositories/InstitutionRepository';
