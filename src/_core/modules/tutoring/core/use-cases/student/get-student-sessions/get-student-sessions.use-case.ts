import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import { GetStudentSessionsInput } from './get-student-sessions.input';
import { GetStudentSessionsOutput } from './get-student-sessions.output';

/**
 * Use case for getting student's tutoring sessions
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for retrieving and organizing a student's tutoring sessions
 */
@injectable()
export class GetStudentSessionsUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository
  ) {}

  /**
   * Executes the use case to get student sessions
   * @param input The input parameters for filtering sessions
   * @returns Promise<GetStudentSessionsOutput> The result containing organized sessions
   */
  async execute(input: GetStudentSessionsInput): Promise<GetStudentSessionsOutput> {
    // Validate input
    this.validateInput(input);

    // Get sessions from repository
    const sessions = await this.tutoringSessionRepository.findByStudentId(
      input.studentId,
      input.status
    );

    // Apply limit if specified
    const limitedSessions = input.limit ? sessions.slice(0, input.limit) : sessions;

    // Separate sessions by time
    const now = new Date();
    const upcomingSessions = limitedSessions.filter(session => {
      const sessionDateTime = new Date(session.scheduledDate);
      return sessionDateTime > now && session.isActive();
    });

    const pastSessions = limitedSessions.filter(session => {
      const sessionDateTime = new Date(session.scheduledDate);
      return sessionDateTime <= now || session.isFinished();
    });

    // Apply filters if specified
    let finalSessions = limitedSessions;
    let finalUpcoming = upcomingSessions;
    let finalPast = pastSessions;

    if (input.includeUpcoming === false) {
      finalUpcoming = [];
      finalSessions = finalSessions.filter(session => !upcomingSessions.includes(session));
    }

    if (input.includePast === false) {
      finalPast = [];
      finalSessions = finalSessions.filter(session => !pastSessions.includes(session));
    }

    // Sort sessions by date (most recent first for past, earliest first for upcoming)
    finalUpcoming.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    finalPast.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
    finalSessions.sort((a, b) => {
      // Upcoming sessions first (earliest first), then past sessions (most recent first)
      const aIsUpcoming = finalUpcoming.includes(a);
      const bIsUpcoming = finalUpcoming.includes(b);
      
      if (aIsUpcoming && bIsUpcoming) {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      }
      
      if (!aIsUpcoming && !bIsUpcoming) {
        return b.scheduledDate.getTime() - a.scheduledDate.getTime();
      }
      
      return aIsUpcoming ? -1 : 1;
    });

    return {
      sessions: finalSessions,
      upcomingSessions: finalUpcoming,
      pastSessions: finalPast,
      totalCount: finalSessions.length,
      upcomingCount: finalUpcoming.length,
      pastCount: finalPast.length
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: GetStudentSessionsInput): void {
    if (!input.studentId || input.studentId.trim() === '') {
      throw new Error('Student ID is required');
    }

    if (input.limit !== undefined && input.limit <= 0) {
      throw new Error('Limit must be greater than 0');
    }
  }
}
