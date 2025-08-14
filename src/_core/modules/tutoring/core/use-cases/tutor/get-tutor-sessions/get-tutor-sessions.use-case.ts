import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { TutoringSession, TutoringSessionStatus } from '../../../entities/TutoringSession';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import { GetTutorSessionsInput } from './get-tutor-sessions.input';
import { GetTutorSessionsOutput } from './get-tutor-sessions.output';

/**
 * Use case for getting tutor's tutoring sessions
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for retrieving and organizing a tutor's tutoring sessions
 */
@injectable()
export class GetTutorSessionsUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository
  ) {}

  /**
   * Executes the use case to get tutor sessions
   * @param input The input parameters for filtering sessions
   * @returns Promise<GetTutorSessionsOutput> The result containing organized sessions
   */
  async execute(input: GetTutorSessionsInput): Promise<GetTutorSessionsOutput> {
    // Validate input
    this.validateInput(input);

    // Get sessions from repository
    let sessions = await this.tutoringSessionRepository.findByTutorId(
      input.tutorId,
      input.status
    );


    // Apply priority filter if specified
    if (input.priority) {
      sessions = sessions.filter(session => session.priority === input.priority);
    }

    // Apply date filter if specified
    if (input.dateFilter) {
      sessions = this.applyDateFilter(sessions, input.dateFilter);
    }

    // Apply limit if specified
    const limitedSessions = input.limit ? sessions.slice(0, input.limit) : sessions;

    // Group sessions by status
    const groupedSessions = {
      scheduled: limitedSessions.filter(s => s.status === TutoringSessionStatus.SCHEDULED),
      inProgress: limitedSessions.filter(s => s.status === TutoringSessionStatus.IN_PROGRESS),
      completed: limitedSessions.filter(s => s.status === TutoringSessionStatus.COMPLETED),
      cancelled: limitedSessions.filter(s => 
        s.status === TutoringSessionStatus.CANCELLED || 
        s.status === TutoringSessionStatus.NO_SHOW
      )
    };

    // Sort sessions within each group
    this.sortSessionGroups(groupedSessions);

    // Sort all sessions (upcoming first, then by date)
    const sortedSessions = this.sortAllSessions(limitedSessions);

    // Get stats if requested
    let stats;
    if (input.includeStats) {
      stats = await this.tutoringSessionRepository.getSessionStats(input.tutorId);
    }


    return {
      sessions: sortedSessions,
      groupedSessions,
      totalCount: limitedSessions.length,
      stats
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: GetTutorSessionsInput): void {
    if (!input.tutorId || input.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }

    if (input.limit !== undefined && input.limit <= 0) {
      throw new Error('Limit must be greater than 0');
    }
  }

  /**
   * Applies date filter to sessions
   */
  private applyDateFilter(sessions: TutoringSession[], dateFilter: string): TutoringSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (dateFilter) {
      case 'today':
        return sessions.filter(session => {
          const sessionDate = new Date(session.scheduledDate);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === today.getTime();
        });

      case 'upcoming':
        return sessions.filter(session => {
          const sessionDate = new Date(session.scheduledDate);
          return sessionDate >= today && session.isActive();
        });

      case 'past':
        return sessions.filter(session => {
          const sessionDate = new Date(session.scheduledDate);
          return sessionDate < today || session.isFinished();
        });

      default:
        return sessions;
    }
  }

  /**
   * Sorts sessions within each status group
   */
  private sortSessionGroups(groupedSessions: {
    scheduled: TutoringSession[];
    inProgress: TutoringSession[];
    completed: TutoringSession[];
    cancelled: TutoringSession[];
  }): void {
    // Sort scheduled and in-progress by date (earliest first)
    groupedSessions.scheduled.sort((a: TutoringSession, b: TutoringSession) => 
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );
    
    groupedSessions.inProgress.sort((a: TutoringSession, b: TutoringSession) => 
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );

    // Sort completed and cancelled by date (most recent first)
    groupedSessions.completed.sort((a: TutoringSession, b: TutoringSession) => 
      b.scheduledDate.getTime() - a.scheduledDate.getTime()
    );
    
    groupedSessions.cancelled.sort((a: TutoringSession, b: TutoringSession) => 
      b.scheduledDate.getTime() - a.scheduledDate.getTime()
    );
  }

  /**
   * Sorts all sessions with priority logic
   */
  private sortAllSessions(sessions: TutoringSession[]): TutoringSession[] {
    return sessions.sort((a, b) => {
      const now = new Date();
      const aIsUpcoming = a.scheduledDate > now && a.isActive();
      const bIsUpcoming = b.scheduledDate > now && b.isActive();

      // Upcoming sessions first
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Within upcoming: earliest first
      if (aIsUpcoming && bIsUpcoming) {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      }

      // Within past/finished: most recent first
      return b.scheduledDate.getTime() - a.scheduledDate.getTime();
    });
  }
}
