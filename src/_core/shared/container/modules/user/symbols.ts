// User module symbols
export const repositories = {
  UserRepository: Symbol.for('UserRepository'),
};

export const useCases = {
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  AuthenticateUserUseCase: Symbol.for('AuthenticateUserUseCase'),
};

// Export all symbols for this module
export const UserSymbols = {
  repositories,
  useCases,
};
