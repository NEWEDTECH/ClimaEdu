import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { TutoringConfig } from '../../../config/tutoring-config';
import { TutoringSessionStatus } from '../../../entities/TutoringSession';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import { UpdateSessionStatusInput } from './update-session-status.input';
import { UpdateSessionStatusOutput } from './update-session-status.output';

/**
 * Use case for updating tutoring session status
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for updating session status with proper validation and state transitions
 */
@injectable()
export class UpdateSessionStatusUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository
  ) {}

  /**
   * Executes the use case to update session status
   * @param input The input parameters for status update
   * @returns Promise<UpdateSessionStatusOutput> The result of the operation
   */
  async execute(input: UpdateSessionStatusInput): Promise<UpdateSessionStatusOutput> {
    // Validate input
    this.validateInput(input);

    // Get the session
    const session = await this.tutoringSessionRepository.findById(input.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify tutor ownership
    if (session.tutorId !== input.tutorId) {
      throw new Error('You are not authorized to update this session');
    }

    // Apply status change based on new status
    switch (input.newStatus) {
      case TutoringSessionStatus.IN_PROGRESS:
        session.start();
        break;

      case TutoringSessionStatus.COMPLETED:
        if (!input.sessionSummary) {
          throw new Error('Session summary is required when completing a session');
        }
        session.complete(input.sessionSummary, input.materials);
        break;

      case TutoringSessionStatus.CANCELLED:
        if (!input.cancelReason) {
          throw new Error('Cancel reason is required when cancelling a session');
        }
        session.cancel(input.cancelReason);
        break;

      case TutoringSessionStatus.NO_SHOW:
        session.markAsNoShow();
        break;

      default:
        throw new Error(`Invalid status transition: ${input.newStatus}`);
    }

    // Save the updated session
    const updatedSession = await this.tutoringSessionRepository.save(session);

    // Get success message based on status
    const message = this.getSuccessMessage(input.newStatus);

    return {
      session: updatedSession,
      success: true,
      message
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: UpdateSessionStatusInput): void {
    if (!input.sessionId || input.sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    if (!input.tutorId || input.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }

    if (!input.newStatus) {
      throw new Error('New status is required');
    }

    // Validate status-specific requirements
    if (input.newStatus === TutoringSessionStatus.COMPLETED && !input.sessionSummary) {
      throw new Error('Session summary is required when completing a session');
    }

    if (input.newStatus === TutoringSessionStatus.CANCELLED && !input.cancelReason) {
      throw new Error('Cancel reason is required when cancelling a session');
    }

    // Validate summary length if provided
    if (input.sessionSummary && input.sessionSummary.length > TutoringConfig.content.maxSummaryLength) {
      throw new Error(`Session summary cannot exceed ${TutoringConfig.content.maxSummaryLength} characters`);
    }

    // Validate cancel reason length if provided
    if (input.cancelReason && input.cancelReason.length > TutoringConfig.content.maxCancelReasonLength) {
      throw new Error(`Cancel reason cannot exceed ${TutoringConfig.content.maxCancelReasonLength} characters`);
    }
  }

  /**
   * Gets the appropriate success message for the status change
   */
  private getSuccessMessage(status: TutoringSessionStatus): string {
    switch (status) {
      case TutoringSessionStatus.SCHEDULED:
        return TutoringConfig.messages.sessionScheduled;
      case TutoringSessionStatus.IN_PROGRESS:
        return TutoringConfig.messages.sessionStarted;
      case TutoringSessionStatus.COMPLETED:
        return TutoringConfig.messages.sessionCompleted;
      case TutoringSessionStatus.CANCELLED:
      case TutoringSessionStatus.NO_SHOW:
        return TutoringConfig.messages.sessionCancelled;
      default:
        return 'Session status updated successfully';
    }
  }
}
