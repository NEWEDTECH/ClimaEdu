// Institution module symbols
export const repositories = {
  InstitutionRepository: Symbol.for('InstitutionRepository'),
};

export const useCases = {
  CreateInstitutionUseCase: Symbol.for('CreateInstitutionUseCase'),
  UpdateInstitutionSettingsUseCase: Symbol.for('UpdateInstitutionSettingsUseCase'),
};

// Export all symbols for this module
export const InstitutionSymbols = {
  repositories,
  useCases,
};
