// Badge module symbols
export const repositories = {
  BadgeRepository: Symbol.for('BadgeRepository'),
  StudentBadgeRepository: Symbol.for('StudentBadgeRepository'),
};

export const useCases = {
  ViewEarnedBadgesUseCase: Symbol.for('ViewEarnedBadgesUseCase'),
};

// Export all symbols for this module
export const BadgeSymbols = {
  repositories,
  useCases,
};
