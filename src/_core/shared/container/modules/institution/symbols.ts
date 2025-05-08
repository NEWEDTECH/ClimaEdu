// Institution module symbols
export const repositories = {
  InstitutionRepository: Symbol.for('InstitutionRepository'),
  UserInstitutionRepository: Symbol.for('UserInstitutionRepository'),
};

export const useCases = {
  CreateInstitutionUseCase: Symbol.for('CreateInstitutionUseCase'),
  UpdateInstitutionSettingsUseCase: Symbol.for('UpdateInstitutionSettingsUseCase'),
  AssociateUserToInstitutionUseCase: Symbol.for('AssociateUserToInstitutionUseCase'),
  AssociateAdministratorUseCase: Symbol.for('AssociateAdministratorUseCase'),
  ListUserInstitutionsUseCase: Symbol.for('ListUserInstitutionsUseCase'),
};

// Export all symbols for this module
export const InstitutionSymbols = {
  repositories,
  useCases,
};
