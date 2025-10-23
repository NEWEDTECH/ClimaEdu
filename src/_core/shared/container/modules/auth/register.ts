import { Container } from 'inversify';
import { services, useCases } from './symbols';

// Import implementations
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { FirebaseAuthService } from '@/_core/modules/auth/infrastructure/implementations/FirebaseAuthService';
import { SendSignInLinkUseCase } from '@/_core/modules/auth/core/use-cases/send-sign-in-link/send-sign-in-link.use-case';
import { SignInWithEmailLinkUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-email-link/sign-in-with-email-link.use-case';
import { SignInWithPasswordUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-password/sign-in-with-password.use-case';
import { SendPasswordResetEmailUseCase } from '@/_core/modules/auth/core/use-cases/send-password-reset-email/send-password-reset-email.use-case';

/**
 * Register Auth module dependencies
 * @param container The DI container
 */
export function registerAuthModule(container: Container): void {
  // Register services
  container.bind<AuthService>(services.AuthService).to(FirebaseAuthService);
  
  // Register use cases
  container.bind(useCases.SendSignInLinkUseCase).to(SendSignInLinkUseCase);
  container.bind(useCases.SignInWithEmailLinkUseCase).to(SignInWithEmailLinkUseCase);
  container.bind(useCases.SignInWithPasswordUseCase).to(SignInWithPasswordUseCase);
  container.bind(useCases.SendPasswordResetEmailUseCase).to(SendPasswordResetEmailUseCase);
}
