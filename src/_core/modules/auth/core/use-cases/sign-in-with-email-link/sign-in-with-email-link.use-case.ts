import { injectable, inject } from 'inversify';
import type { AuthService } from '../../../infrastructure/services/AuthService';
import { SignInWithEmailLinkInput } from './sign-in-with-email-link.input';
import { SignInWithEmailLinkOutput } from './sign-in-with-email-link.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for signing in with an email link
 * Following Clean Architecture principles, this use case depends only on the service interface
 */
@injectable()
export class SignInWithEmailLinkUseCase {
  constructor(
    @inject(Register.auth.service.AuthService)
    private authService: AuthService
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: SignInWithEmailLinkInput): Promise<SignInWithEmailLinkOutput> {
    try {
      // Check if the link is a valid sign-in link
      if (!this.authService.isSignInWithEmailLink(input.link)) {
        return { success: false, userId: null };
      }

      // Sign in with the email link
      const userId = await this.authService.signInWithEmailLink(input.email, input.link);
      
      return { success: true, userId };
    } catch (error) {
      console.error('Error in SignInWithEmailLinkUseCase:', error);
      return { success: false, userId: null };
    }
  }
}
