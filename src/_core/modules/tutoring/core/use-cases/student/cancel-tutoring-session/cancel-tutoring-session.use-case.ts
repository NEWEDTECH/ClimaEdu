import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { TutoringConfig } from '../../../config/tutoring-config';
import { TutoringSession, TutoringSessionStatus } from '../../../entities/TutoringSession';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import { CancelTutoringSessionInput } from './cancel-tutoring-session.input';
import { CancelTutoringSessionOutput } from './cancel-tutoring-session.output';

/**
 * Use case for cancelling a tutoring session by student
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for cancelling sessions with proper authorization and validation
 */
@injectable()
export class CancelTutoringSessionUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository
  ) {}

  /**
   * Executes the use case to cancel a tutoring session
   * @param input The input parameters for cancellation
   * @returns Promise<CancelTutoringSessionOutput> The result of the operation
   */
  async execute(input: CancelTutoringSessionInput): Promise<CancelTutoringSessionOutput> {
    // Validate input
    this.validateInput(input);

    // Get the session
    const session = await this.tutoringSessionRepository.findById(input.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify student ownership
    if (session.studentId !== input.studentId) {
      throw new Error('You are not authorized to cancel this session');
    }

    // Check if session can be cancelled
    this.validateCancellationRules(session);

    // Cancel the session
    session.cancel(input.cancelReason);

    // Save the updated session
    const updatedSession = await this.tutoringSessionRepository.save(session);

    return {
      session: updatedSession,
      success: true,
      message: TutoringConfig.messages.sessionCancelled
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: CancelTutoringSessionInput): void {
    if (!input.sessionId || input.sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    if (!input.studentId || input.studentId.trim() === '') {
      throw new Error('Student ID is required');
    }

    if (!input.cancelReason || input.cancelReason.trim() === '') {
      throw new Error('Cancel reason is required');
    }

    if (input.cancelReason.length > TutoringConfig.content.maxCancelReasonLength) {
      throw new Error(`Cancel reason cannot exceed ${TutoringConfig.content.maxCancelReasonLength} characters`);
    }
  }

  /**
   * Validates business rules for cancellation
   */
  private validateCancellationRules(session: TutoringSession): void {
    // Students can only cancel SCHEDULED sessions
    if (session.status !== TutoringSessionStatus.SCHEDULED) {
      throw new Error('This session cannot be cancelled in its current state');
    }

    // Check if cancellation is allowed based on timing
    const now = new Date();
    const sessionTime = new Date(session.scheduledDate);
    const timeDifference = sessionTime.getTime() - now.getTime();
    const hoursUntilSession = timeDifference / (1000 * 60 * 60);

    // Allow cancellation if session is more than minimum advance notice away
    if (hoursUntilSession < TutoringConfig.scheduling.minAdvanceHours) {
      throw new Error(`Sessions can only be cancelled at least ${TutoringConfig.scheduling.minAdvanceHours} hour(s) in advance`);
    }
  }
}
