// User module symbols
export const repositories = {
  UserRepository: Symbol.for('UserRepository'),
  UserAccessHistoryRepository: Symbol.for('UserAccessHistoryRepository'),
};

export const useCases = {
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  CreateSuperAdminUseCase: Symbol.for('CreateSuperAdminUseCase'),
  AuthenticateUserUseCase: Symbol.for('AuthenticateUserUseCase'),
  GetUserAssociationsUseCase: Symbol.for('GetUserAssociationsUseCase'),
  GetUserByIdUseCase: Symbol.for('GetUserByIdUseCase'),
  ListUsersByRoleUseCase: Symbol.for('ListUsersByRoleUseCase'),
  ProcessCSVUsersUseCase: Symbol.for('ProcessCSVUsersUseCase'),
  ProcessCSVUsersWithInstitutionUseCase: Symbol.for('ProcessCSVUsersWithInstitutionUseCase'),
  RecordDailyAccessUseCase: Symbol.for('RecordDailyAccessUseCase'),
};

// Export all symbols for this module
export const UserSymbols = {
  repositories,
  useCases,
};
