import { injectable, inject } from 'inversify';
import type { AuthService } from '../../../infrastructure/services/AuthService';
import { SendPasswordResetEmailInput } from './send-password-reset-email.input';
import { SendPasswordResetEmailOutput } from './send-password-reset-email.output';
import { Register } from '@/_core/shared/container/symbols';

/**
 * Use case for sending a password reset email to the user
 * Following Clean Architecture principles, this use case depends only on the service interface
 */
@injectable()
export class SendPasswordResetEmailUseCase {
  constructor(
    @inject(Register.auth.service.AuthService)
    private authService: AuthService
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: SendPasswordResetEmailInput): Promise<SendPasswordResetEmailOutput> {
    try {
      await this.authService.sendPasswordResetEmail(input.email);
      return { 
        success: true,
        message: 'Email de recuperação enviado com sucesso'
      };
    } catch (error) {
      console.error('Error in SendPasswordResetEmailUseCase:', error);
      return { 
        success: false,
        message: 'Erro ao enviar email de recuperação'
      };
    }
  }
}
