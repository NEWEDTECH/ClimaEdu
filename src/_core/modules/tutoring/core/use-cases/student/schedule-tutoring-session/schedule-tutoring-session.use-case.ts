import { inject, injectable } from 'inversify';
import { TutoringSession } from '../../../entities/TutoringSession';
import { TutoringConfig } from '../../../config/tutoring-config';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { ContentSymbols } from '@/_core/shared/container/modules/content/symbols';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import type { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository';
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
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  /**
   * Executes the use case to schedule a tutoring session
   * @param input The input parameters for scheduling
   * @returns Promise<ScheduleTutoringSessionOutput> The result of the operation
   */
  async execute(input: ScheduleTutoringSessionInput): Promise<ScheduleTutoringSessionOutput> {
    // Use the tutor chosen by the student (validated against the course),
    // or fall back to the first tutor of the course
    const tutorId = await this.resolveTutor(input.courseId, input.tutorId);

    // Check for scheduling conflicts
    await this.checkForConflicts(input, tutorId);

    // Generate session ID
    const sessionId = await this.tutoringSessionRepository.generateId();

    // Create the tutoring session entity (validation happens in entity)
    const session = TutoringSession.create({
      id: sessionId,
      studentId: input.studentId,
      tutorId: tutorId,
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
   * Resolves which tutor the session belongs to
   * @param courseId The course ID
   * @param requestedTutorId Tutor chosen by the student (optional)
   * @returns The tutor ID
   * @throws Error if the course has no tutors or the requested tutor doesn't teach the course
   */
  private async resolveTutor(courseId: string, requestedTutorId?: string): Promise<string> {
    const courseTutors = await this.courseTutorRepository.findByCourseId(courseId);

    if (courseTutors.length === 0) {
      throw new Error(`No tutor found for course ${courseId}`);
    }

    if (requestedTutorId) {
      const isCourseTutor = courseTutors.some(courseTutor => courseTutor.userId === requestedTutorId);
      if (!isCourseTutor) {
        throw new Error('O tutor selecionado não atende este curso');
      }
      return requestedTutorId;
    }

    return courseTutors[0].userId;
  }

  /**
   * Checks for scheduling conflicts with existing sessions
   */
  private async checkForConflicts(input: ScheduleTutoringSessionInput, tutorId: string): Promise<void> {
    // Check for tutor conflicts
    const tutorConflicts = await this.tutoringSessionRepository.findConflictingSessions(
      tutorId,
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

}
