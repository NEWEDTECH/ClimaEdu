import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { TutoringConfig } from '../../../config/tutoring-config';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import { AddSessionNotesInput } from './add-session-notes.input';
import { AddSessionNotesOutput } from './add-session-notes.output';

/**
 * Use case for adding notes to a tutoring session
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for adding tutor notes with proper authorization and validation
 */
@injectable()
export class AddSessionNotesUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository
  ) {}

  /**
   * Executes the use case to add notes to a session
   * @param input The input parameters for adding notes
   * @returns Promise<AddSessionNotesOutput> The result of the operation
   */
  async execute(input: AddSessionNotesInput): Promise<AddSessionNotesOutput> {
    // Validate input
    this.validateInput(input);

    // Get the session
    const session = await this.tutoringSessionRepository.findById(input.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify tutor ownership
    if (session.tutorId !== input.tutorId) {
      throw new Error('You are not authorized to add notes to this session');
    }

    // Add notes to the session
    session.addTutorNotes(input.notes);

    // Save the updated session
    const updatedSession = await this.tutoringSessionRepository.save(session);

    return {
      session: updatedSession,
      success: true,
      message: 'Session notes updated successfully'
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: AddSessionNotesInput): void {
    if (!input.sessionId || input.sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    if (!input.tutorId || input.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }

    if (!input.notes || input.notes.trim() === '') {
      throw new Error('Notes are required');
    }

    if (input.notes.length > TutoringConfig.content.maxNotesLength) {
      throw new Error(`Notes cannot exceed ${TutoringConfig.content.maxNotesLength} characters`);
    }
  }
}
