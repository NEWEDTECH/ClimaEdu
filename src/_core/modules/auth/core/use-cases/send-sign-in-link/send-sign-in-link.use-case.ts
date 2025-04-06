import { injectable, inject } from 'inversify';
import type { AuthService } from '../../../infrastructure/services/AuthService';
import { SendSignInLinkInput } from './send-sign-in-link.input';
import { SendSignInLinkOutput } from './send-sign-in-link.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for sending a sign-in link to the user's email
 * Following Clean Architecture principles, this use case depends only on the service interface
 */
@injectable()
export class SendSignInLinkUseCase {
  constructor(
    @inject(Register.auth.service.AuthService)
    private authService: AuthService
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: SendSignInLinkInput): Promise<SendSignInLinkOutput> {
    try {
      await this.authService.sendSignInLinkToEmail(input.email, input.redirectUrl);
      return { success: true };
    } catch (error) {
      console.error('Error in SendSignInLinkUseCase:', error);
      return { success: false };
    }
  }
}
