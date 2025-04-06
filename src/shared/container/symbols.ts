// Symbol registry for dependency injection

// User module symbols
export const UserSymbols = {
  repositories: {
    UserRepository: Symbol.for('UserRepository'),
  },
  useCases: {
    CreateUserUseCase: Symbol.for('CreateUserUseCase'),
    AuthenticateUserUseCase: Symbol.for('AuthenticateUserUseCase'),
  },
};

// Content module symbols
export const ContentSymbols = {
  repositories: {
    ContentRepository: Symbol.for('ContentRepository'),
  },
  useCases: {
    CreateContentUseCase: Symbol.for('CreateContentUseCase'),
    ListContentsUseCase: Symbol.for('ListContentsUseCase'),
  },
};

// Register object to simplify imports
export const Register = {
  user: {
    repository: UserSymbols.repositories,
    useCase: UserSymbols.useCases,
  },
  content: {
    repository: ContentSymbols.repositories,
    useCase: ContentSymbols.useCases,
  },
};
