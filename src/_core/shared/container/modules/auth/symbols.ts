// Auth module symbols
export const services = {
  AuthService: Symbol.for('AuthService'),
};

export const useCases = {
  SendSignInLinkUseCase: Symbol.for('SendSignInLinkUseCase'),
  SignInWithEmailLinkUseCase: Symbol.for('SignInWithEmailLinkUseCase'),
  SignInWithPasswordUseCase: Symbol.for('SignInWithPasswordUseCase'),
  SendPasswordResetEmailUseCase: Symbol.for('SendPasswordResetEmailUseCase'),
};

// Export all symbols for this module
export const AuthSymbols = {
  services,
  useCases,
};
