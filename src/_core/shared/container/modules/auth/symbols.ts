// Auth module symbols
export const services = {
  AuthService: Symbol.for('AuthService'),
};

export const useCases = {
  SendSignInLinkUseCase: Symbol.for('SendSignInLinkUseCase'),
  SignInWithEmailLinkUseCase: Symbol.for('SignInWithEmailLinkUseCase'),
};

// Export all symbols for this module
export const AuthSymbols = {
  services,
  useCases,
};
