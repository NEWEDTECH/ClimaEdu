import { injectable, inject } from 'inversify';
import { UpdateTutoringSessionInput } from './update-tutoring-session.input';
import { UpdateTutoringSessionOutput } from './update-tutoring-session.output';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';

@injectable()
export class UpdateTutoringSessionUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository
  ) {}

  /**
   * Updates a tutoring session with the provided data
   * The session entity should already have business rules applied via its methods
   * @param input The input parameters containing the updated session
   * @returns Promise<UpdateTutoringSessionOutput> The result of the update operation
   */
  async execute(input: UpdateTutoringSessionInput): Promise<UpdateTutoringSessionOutput> {
    // Validate input
    this.validateInput(input);

    try {
      // Verify the session exists and belongs to the tutor
      const existingSession = await this.tutoringSessionRepository.findById(input.sessionId);
      
      if (!existingSession) {
        throw new Error('Sessão de tutoria não encontrada');
      }

      if (existingSession.tutorId !== input.tutorId) {
        throw new Error('Você não tem permissão para atualizar esta sessão');
      }

      // Update the session in the repository
      // The entity already has business rules applied, so we just persist it
      await this.tutoringSessionRepository.save(input.updatedSession);

      return {
        success: true,
        message: 'Sessão atualizada com sucesso'
      };

    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Erro interno ao atualizar sessão'
      );
    }
  }

  /**
   * Validates the input parameters
   * @param input The input to validate
   * @throws Error if validation fails
   */
  private validateInput(input: UpdateTutoringSessionInput): void {
    if (!input.sessionId || input.sessionId.trim() === '') {
      throw new Error('ID da sessão é obrigatório');
    }

    if (!input.tutorId || input.tutorId.trim() === '') {
      throw new Error('ID do tutor é obrigatório');
    }

    if (!input.updatedSession) {
      throw new Error('Dados da sessão atualizada são obrigatórios');
    }

    if (input.updatedSession.id !== input.sessionId) {
      throw new Error('ID da sessão não confere com os dados fornecidos');
    }

    if (input.updatedSession.tutorId !== input.tutorId) {
      throw new Error('ID do tutor não confere com os dados da sessão');
    }
  }
}
