// Symbol registry for dependency injection

// Institution module symbols
export const InstitutionSymbols = {
  repositories: {
    InstitutionRepository: Symbol.for('InstitutionRepository'),
  },
  useCases: {
    CreateInstitutionUseCase: Symbol.for('CreateInstitutionUseCase'),
    UpdateInstitutionSettingsUseCase: Symbol.for('UpdateInstitutionSettingsUseCase'),
  },
};

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

// Auth module symbols
export const AuthSymbols = {
  services: {
    AuthService: Symbol.for('AuthService'),
  },
  useCases: {
    SendSignInLinkUseCase: Symbol.for('SendSignInLinkUseCase'),
    SignInWithEmailLinkUseCase: Symbol.for('SignInWithEmailLinkUseCase'),
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
  auth: {
    service: AuthSymbols.services,
    useCase: AuthSymbols.useCases,
  },
  institution: {
    repository: InstitutionSymbols.repositories,
    useCase: InstitutionSymbols.useCases,
  },
};
