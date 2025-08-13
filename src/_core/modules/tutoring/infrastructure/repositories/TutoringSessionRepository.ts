import { TutoringSession, TutoringSessionStatus } from '../../core/entities/TutoringSession';

/**
 * Repository interface for TutoringSession entity
 * Following Clean Architecture principles, this interface defines the contract
 * for persistence operations without depending on specific implementations
 */
export interface TutoringSessionRepository {
  /**
   * Generates a unique ID for a new tutoring session
   * @returns Promise<string> A unique ID with 'tut_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Saves a tutoring session to the repository
   * @param session The tutoring session to save
   * @returns Promise<TutoringSession> The saved session
   */
  save(session: TutoringSession): Promise<TutoringSession>;

  /**
   * Finds a tutoring session by its ID
   * @param id The session ID
   * @returns Promise<TutoringSession | null> The session if found, null otherwise
   */
  findById(id: string): Promise<TutoringSession | null>;

  /**
   * Finds all tutoring sessions for a specific student
   * @param studentId The student's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  findByStudentId(studentId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]>;

  /**
   * Finds all tutoring sessions for a specific tutor
   * @param tutorId The tutor's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  findByTutorId(tutorId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]>;

  /**
   * Finds all tutoring sessions for a specific subject
   * @param subjectId The subject's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  findBySubjectId(subjectId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]>;

  /**
   * Finds all tutoring sessions for a specific course
   * @param courseId The course's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  findByCourseId(courseId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]>;

  /**
   * Finds tutoring sessions scheduled for a specific date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @param tutorId Optional tutor filter
   * @param studentId Optional student filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    tutorId?: string,
    studentId?: string
  ): Promise<TutoringSession[]>;

  /**
   * Finds upcoming tutoring sessions (scheduled for future dates)
   * @param tutorId Optional tutor filter
   * @param studentId Optional student filter
   * @param limit Optional limit for results
   * @returns Promise<TutoringSession[]> Array of upcoming sessions
   */
  findUpcoming(
    tutorId?: string,
    studentId?: string,
    limit?: number
  ): Promise<TutoringSession[]>;

  /**
   * Finds overdue tutoring sessions (scheduled time has passed but not started)
   * @param tutorId Optional tutor filter
   * @returns Promise<TutoringSession[]> Array of overdue sessions
   */
  findOverdue(tutorId?: string): Promise<TutoringSession[]>;

  /**
   * Finds sessions that conflict with a given time slot
   * @param tutorId The tutor's ID
   * @param scheduledDate The proposed session date
   * @param duration The session duration in minutes
   * @returns Promise<TutoringSession[]> Array of conflicting sessions
   */
  findConflictingSessions(
    tutorId: string,
    scheduledDate: Date,
    duration: number
  ): Promise<TutoringSession[]>;

  /**
   * Gets session statistics for a tutor
   * @param tutorId The tutor's ID
   * @param startDate Optional start date for the period
   * @param endDate Optional end date for the period
   * @returns Promise<SessionStats> Statistics object
   */
  getSessionStats(
    tutorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SessionStats>;

  /**
   * Gets session statistics for a student
   * @param studentId The student's ID
   * @param startDate Optional start date for the period
   * @param endDate Optional end date for the period
   * @returns Promise<SessionStats> Statistics object
   */
  getStudentSessionStats(
    studentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SessionStats>;

  /**
   * Deletes a tutoring session
   * @param id The session ID
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a session exists
   * @param id The session ID
   * @returns Promise<boolean> True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Interface for session statistics
 */
export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  averageRating?: number;
  totalHours: number;
  upcomingSessions: number;
}
