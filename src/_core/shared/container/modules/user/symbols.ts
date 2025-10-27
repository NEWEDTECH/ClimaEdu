// User module symbols
export const repositories = {
  UserRepository: Symbol.for('UserRepository'),
};

export const useCases = {
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  CreateSuperAdminUseCase: Symbol.for('CreateSuperAdminUseCase'),
  AuthenticateUserUseCase: Symbol.for('AuthenticateUserUseCase'),
  GetUserAssociationsUseCase: Symbol.for('GetUserAssociationsUseCase'),
  GetUserByIdUseCase: Symbol.for('GetUserByIdUseCase'),
  ProcessCSVUsersUseCase: Symbol.for('ProcessCSVUsersUseCase'),
  ProcessCSVUsersWithInstitutionUseCase: Symbol.for('ProcessCSVUsersWithInstitutionUseCase'),
};

// Export all symbols for this module
export const UserSymbols = {
  repositories,
  useCases,
};
