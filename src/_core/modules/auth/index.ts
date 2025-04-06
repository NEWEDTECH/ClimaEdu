// This file serves as the public API for the Auth module

// Re-export services
export * from './infrastructure/services/AuthService';
export * from './infrastructure/implementations/FirebaseAuthService';

// Re-export use cases
export * from './core/use-cases/send-sign-in-link/send-sign-in-link.input';
export * from './core/use-cases/send-sign-in-link/send-sign-in-link.output';
export * from './core/use-cases/send-sign-in-link/send-sign-in-link.use-case';

export * from './core/use-cases/sign-in-with-email-link/sign-in-with-email-link.input';
export * from './core/use-cases/sign-in-with-email-link/sign-in-with-email-link.output';
export * from './core/use-cases/sign-in-with-email-link/sign-in-with-email-link.use-case';
