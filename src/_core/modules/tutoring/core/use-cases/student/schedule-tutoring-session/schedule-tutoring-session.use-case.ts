import { inject, injectable } from 'inversify';
import { TutoringSession } from '../../../entities/TutoringSession';
import { TutoringConfig } from '../../../config/tutoring-config';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import type { SubjectRepository } from '../../../../infrastructure/repositories/SubjectRepository';
import { ScheduleTutoringSessionInput } from './schedule-tutoring-session.input';
import { ScheduleTutoringSessionOutput } from './schedule-tutoring-session.output';

/**
 * Use case for scheduling a tutoring session
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for creating and scheduling a new tutoring session
 */
@injectable()
export class ScheduleTutoringSessionUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly tutoringSessionRepository: TutoringSessionRepository,
    @inject(TutoringSymbols.repositories.SubjectRepository)
    private readonly subjectRepository: SubjectRepository
  ) {}

  /**
   * Executes the use case to schedule a tutoring session
   * @param input The input parameters for scheduling
   * @returns Promise<ScheduleTutoringSessionOutput> The result of the operation
   */
  async execute(input: ScheduleTutoringSessionInput): Promise<ScheduleTutoringSessionOutput> {
    // Check for scheduling conflicts
    await this.checkForConflicts(input);

    // Verify subject exists and is active
    await this.verifySubject(input.subjectId);

    // Generate session ID
    const sessionId = await this.tutoringSessionRepository.generateId();

    // Create the tutoring session entity (validation happens in entity)
    const session = TutoringSession.create({
      id: sessionId,
      studentId: input.studentId,
      tutorId: input.tutorId,
      subjectId: input.subjectId,
      courseId: input.courseId,
      scheduledDate: input.scheduledDate,
      duration: input.duration,
      studentQuestion: input.studentQuestion,
      priority: input.priority
    });

    // Save the session
    const savedSession = await this.tutoringSessionRepository.save(session);

    return {
      session: savedSession,
      success: true,
      message: TutoringConfig.messages.sessionScheduled
    };
  }


  /**
   * Checks for scheduling conflicts with existing sessions
   */
  private async checkForConflicts(input: ScheduleTutoringSessionInput): Promise<void> {
    // Check for tutor conflicts
    const tutorConflicts = await this.tutoringSessionRepository.findConflictingSessions(
      input.tutorId,
      input.scheduledDate,
      input.duration
    );

    if (tutorConflicts.length > 0) {
      throw new Error(TutoringConfig.errors.tutorConflict);
    }

    // Check for student conflicts (only if business rule allows)
    if (!TutoringConfig.rules.allowStudentConflicts) {
      const studentSessions = await this.tutoringSessionRepository.findByStudentId(input.studentId);
      const studentConflicts = studentSessions.filter(session => {
        if (!session.isActive()) {
          return false;
        }

        const sessionStart = session.scheduledDate.getTime();
        const sessionEnd = sessionStart + (session.duration * 60000);
        const requestedStart = input.scheduledDate.getTime();
        const requestedEnd = requestedStart + (input.duration * 60000);

        return (requestedStart < sessionEnd && sessionStart < requestedEnd);
      });

      if (studentConflicts.length > 0) {
        throw new Error(TutoringConfig.errors.studentConflict);
      }
    }
  }

  /**
   * Verifies that the subject exists and is active
   */
  private async verifySubject(subjectId: string): Promise<void> {
    const subject = await this.subjectRepository.findById(subjectId);
    
    if (!subject) {
      throw new Error(TutoringConfig.errors.subjectNotFound);
    }

    if (!subject.isActive) {
      throw new Error(TutoringConfig.errors.subjectInactive);
    }
  }
}
