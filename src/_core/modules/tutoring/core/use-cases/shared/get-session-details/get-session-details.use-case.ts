import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { TutoringSession, TutoringSessionStatus } from '../../../entities/TutoringSession';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import type { SubjectRepository } from '../../../../infrastructure/repositories/SubjectRepository';
import { GetSessionDetailsInput } from './get-session-details.input';
import { GetSessionDetailsOutput } from './get-session-details.output';

/**
 * Use case for getting detailed session information
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for retrieving session details with authorization and permission checks
 */
@injectable()
export class GetSessionDetailsUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository,
    @inject(TutoringSymbols.repositories.SubjectRepository)
    private readonly subjectRepository: SubjectRepository
  ) {}

  /**
   * Executes the use case to get session details
   * @param input The input parameters for getting session details
   * @returns Promise<GetSessionDetailsOutput> The result containing session details and permissions
   */
  async execute(input: GetSessionDetailsInput): Promise<GetSessionDetailsOutput> {
    // Validate input
    this.validateInput(input);

    // Get the session
    const session = await this.tutoringSessionRepository.findById(input.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify user has access to this session
    const hasAccess = session.studentId === input.userId || session.tutorId === input.userId;
    if (!hasAccess) {
      throw new Error('You are not authorized to view this session');
    }

    // Get subject information
    const subject = await this.subjectRepository.findById(session.subjectId);
    if (!subject) {
      throw new Error('Subject not found');
    }

    // Determine user permissions
    const isTutor = session.tutorId === input.userId;
    const isStudent = session.studentId === input.userId;

    // Calculate permissions based on user role and session state
    const permissions = this.calculatePermissions(session, isTutor, isStudent);

    return {
      session,
      subject,
      ...permissions
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: GetSessionDetailsInput): void {
    if (!input.sessionId || input.sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }

    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required');
    }
  }

  /**
   * Calculates user permissions based on role and session state
   */
  private calculatePermissions(session: TutoringSession, isTutor: boolean, isStudent: boolean): {
    canEdit: boolean;
    canCancel: boolean;
    canStart: boolean;
    canComplete: boolean;
    isOverdue: boolean;
  } {
    const isOverdue = session.isOverdue();

    // Base permissions
    let canEdit = false;
    let canCancel = false;
    let canStart = false;
    let canComplete = false;

    if (isTutor) {
      // Tutor permissions
      switch (session.status) {
        case TutoringSessionStatus.REQUESTED:
          canEdit = true; // Can approve/reject
          canCancel = true;
          break;

        case TutoringSessionStatus.SCHEDULED:
          canEdit = true; // Can add notes, reschedule
          canCancel = true;
          canStart = !isOverdue; // Can only start if not overdue
          break;

        case TutoringSessionStatus.IN_PROGRESS:
          canEdit = true; // Can add notes
          canComplete = true;
          canCancel = true; // Emergency cancellation
          break;

        case TutoringSessionStatus.COMPLETED:
          canEdit = true; // Can edit notes/summary
          break;

        case TutoringSessionStatus.CANCELLED:
        case TutoringSessionStatus.NO_SHOW:
          // No actions available for cancelled/no-show sessions
          break;
      }
    } else if (isStudent) {
      // Student permissions
      switch (session.status) {
        case TutoringSessionStatus.REQUESTED:
          canCancel = true; // Can cancel before tutor approval
          break;

        case TutoringSessionStatus.SCHEDULED:
          canCancel = true; // Can cancel scheduled sessions
          break;

        case TutoringSessionStatus.IN_PROGRESS:
          // Students cannot directly control in-progress sessions
          break;

        case TutoringSessionStatus.COMPLETED:
          // Students can view but not edit completed sessions
          break;

        case TutoringSessionStatus.CANCELLED:
        case TutoringSessionStatus.NO_SHOW:
          // No actions available for cancelled/no-show sessions
          break;
      }
    }

    return {
      canEdit,
      canCancel,
      canStart,
      canComplete,
      isOverdue
    };
  }
}
