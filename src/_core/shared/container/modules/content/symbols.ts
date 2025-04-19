// Content module symbols
export const repositories = {
  ContentRepository: Symbol.for('ContentRepository'),
};

export const useCases = {
  CreateContentUseCase: Symbol.for('CreateContentUseCase'),
  ListContentsUseCase: Symbol.for('ListContentsUseCase'),
};

// Export all symbols for this module
export const ContentSymbols = {
  repositories,
  useCases,
};
