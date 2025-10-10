import { injectable, inject } from 'inversify';
import type { AuthService } from '../../../infrastructure/services/AuthService';
import { Register } from '@/_core/shared/container/symbols';
import { SignInWithPasswordInput } from './sign-in-with-password.input';
import { SignInWithPasswordOutput } from './sign-in-with-password.output';

/**
 * Use case for signing in with email and password
 * Following Clean Architecture principles, this use case depends only on the AuthService interface
 */
@injectable()
export class SignInWithPasswordUseCase {
  constructor(
    @inject(Register.auth.service.AuthService)
    private authService: AuthService
  ) {}

  /**
   * Execute the use case
   * @param input Input data containing email and password
   * @returns Output data with userId and success flag
   */
  async execute(input: SignInWithPasswordInput): Promise<SignInWithPasswordOutput> {
    try {
      const userId = await this.authService.signInWithEmailAndPassword(
        input.email,
        input.password
      );

      return new SignInWithPasswordOutput(userId, true);
    } catch (error) {
      console.error('Error in SignInWithPasswordUseCase:', error);
      throw error;
    }
  }
}
