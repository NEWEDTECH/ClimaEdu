export const repositories = {
  FAQRepository: Symbol.for('FAQRepository'),
};

export const useCases = {
  ListFaqsByInstitutionUseCase: Symbol.for('ListFaqsByInstitutionUseCase'),
  CreateFaqUseCase: Symbol.for('CreateFaqUseCase'),
  UpdateFaqUseCase: Symbol.for('UpdateFaqUseCase'),
  DeleteFaqUseCase: Symbol.for('DeleteFaqUseCase'),
};

export const FaqSymbols = {
  repositories,
  useCases,
};
