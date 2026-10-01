import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  DocumentData, 
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { TutoringSession, TutoringSessionStatus, SessionPriority } from '../../../core/entities/TutoringSession';
import type { TutoringSessionRepository, SessionStats } from '../TutoringSessionRepository';
import { nanoid } from 'nanoid';

/**
 * Firebase implementation of the TutoringSessionRepository
 */
@injectable()
export class FirebaseTutoringSessionRepository implements TutoringSessionRepository {
  private readonly collectionName = 'tutoring-sessions';
  private readonly idPrefix = 'tut_';

  /**
   * Generate a new unique ID for a tutoring session
   * @returns A unique ID with the tutoring session prefix
   */
  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  /**
   * Private adapter method to convert Firestore document data to a TutoringSession entity
   * @param data Firestore document data
   * @returns TutoringSession entity
   */
  private mapToEntity(data: DocumentData): TutoringSession {
    // Convert Firestore timestamps to Date objects
    const scheduledDate = data.scheduledDate instanceof Timestamp 
      ? data.scheduledDate.toDate() 
      : new Date(data.scheduledDate);
    
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
    
    // Create and return a TutoringSession entity preserving all fields including status
    return TutoringSession.fromData({
      id: data.id,
      studentId: data.studentId,
      tutorId: data.tutorId,
      courseId: data.courseId,
      scheduledDate,
      duration: data.duration,
      status: data.status || TutoringSessionStatus.SCHEDULED,
      studentQuestion: data.studentQuestion,
      priority: data.priority || SessionPriority.MEDIUM,
      createdAt,
      updatedAt,
      tutorNotes: data.tutorNotes || undefined,
      sessionSummary: data.sessionSummary || undefined,
      materials: data.materials || undefined,
      cancelReason: data.cancelReason || undefined,
      meetingUrl: data.meetingUrl || undefined
    });
  }

  /**
   * Private method to convert TutoringSession entity to Firestore document data
   * @param session TutoringSession entity
   * @returns Firestore document data
   */
  private mapToFirestoreData(session: TutoringSession): DocumentData {
    return {
      id: session.id,
      studentId: session.studentId,
      tutorId: session.tutorId,
      courseId: session.courseId,
      scheduledDate: session.scheduledDate,
      duration: session.duration,
      status: session.status,
      studentQuestion: session.studentQuestion,
      priority: session.priority,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      tutorNotes: session.tutorNotes || null,
      sessionSummary: session.sessionSummary || null,
      materials: session.materials || null,
      cancelReason: session.cancelReason || null,
      meetingUrl: session.meetingUrl || null
    };
  }

  /**
   * Saves a tutoring session to the repository
   * @param session The tutoring session to save
   * @returns Promise<TutoringSession> The saved session
   */
  async save(session: TutoringSession): Promise<TutoringSession> {
    const sessionRef = doc(firestore, this.collectionName, session.id);
    const sessionData = this.mapToFirestoreData(session);
    
    // Check if the session already exists
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      // Update existing session
      await updateDoc(sessionRef, sessionData);
    } else {
      // Create new session
      await setDoc(sessionRef, sessionData);
    }

    return session;
  }

  /**
   * Finds a tutoring session by its ID
   * @param id The session ID
   * @returns Promise<TutoringSession | null> The session if found, null otherwise
   */
  async findById(id: string): Promise<TutoringSession | null> {
    const sessionRef = doc(firestore, this.collectionName, id);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return null;
    }

    const data = sessionDoc.data();
    return this.mapToEntity({ id, ...data });
  }

  /*
   * Consultas sem índice composto: o Firestore de produção só tem os índices
   * automáticos de campo único, e combinar filtros/ordenação em campos diferentes
   * fazia as consultas falharem ("requires an index") — o agendamento nunca funcionou.
   * Cada busca usa um único campo de igualdade e o restante é filtrado/ordenado em memória
   * (o volume por tutor/aluno/curso é pequeno).
   */

  /** Busca as sessões por um único campo de igualdade */
  private async findAllBy(
    field: 'studentId' | 'tutorId' | 'courseId' | 'status',
    value: string
  ): Promise<TutoringSession[]> {
    const q = query(collection(firestore, this.collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToEntity({ id: doc.id, ...doc.data() }));
  }

  private sortByScheduledDate(sessions: TutoringSession[], direction: 'asc' | 'desc'): TutoringSession[] {
    const factor = direction === 'asc' ? 1 : -1;
    return sessions.sort((a, b) => factor * (a.scheduledDate.getTime() - b.scheduledDate.getTime()));
  }

  private isWithin(session: TutoringSession, startDate?: Date, endDate?: Date): boolean {
    const time = session.scheduledDate.getTime();
    return (!startDate || time >= startDate.getTime()) && (!endDate || time <= endDate.getTime());
  }

  /**
   * Finds all tutoring sessions for a specific student
   * @param studentId The student's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByStudentId(studentId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessions = await this.findAllBy('studentId', studentId);
    return this.sortByScheduledDate(sessions.filter(s => !status || s.status === status), 'desc');
  }

  /**
   * Finds all tutoring sessions for a specific tutor
   * @param tutorId The tutor's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByTutorId(tutorId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessions = await this.findAllBy('tutorId', tutorId);
    return this.sortByScheduledDate(sessions.filter(s => !status || s.status === status), 'desc');
  }

  /**
   * Finds all tutoring sessions for a specific course
   * @param courseId The course's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByCourseId(courseId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessions = await this.findAllBy('courseId', courseId);
    return this.sortByScheduledDate(sessions.filter(s => !status || s.status === status), 'desc');
  }

  /**
   * Finds tutoring sessions scheduled for a specific date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @param tutorId Optional tutor filter
   * @param studentId Optional student filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    tutorId?: string,
    studentId?: string
  ): Promise<TutoringSession[]> {
    let sessions: TutoringSession[];

    if (tutorId) {
      sessions = await this.findAllBy('tutorId', tutorId);
    } else if (studentId) {
      sessions = await this.findAllBy('studentId', studentId);
    } else {
      // Intervalo em um único campo não exige índice composto
      const q = query(
        collection(firestore, this.collectionName),
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      sessions = querySnapshot.docs.map(doc => this.mapToEntity({ id: doc.id, ...doc.data() }));
    }

    return this.sortByScheduledDate(sessions.filter(s => this.isWithin(s, startDate, endDate)), 'asc');
  }

  /**
   * Finds upcoming tutoring sessions (scheduled for future dates)
   * @param tutorId Optional tutor filter
   * @param studentId Optional student filter
   * @param limitCount Optional limit for results
   * @returns Promise<TutoringSession[]> Array of upcoming sessions
   */
  async findUpcoming(
    tutorId?: string,
    studentId?: string,
    limitCount?: number
  ): Promise<TutoringSession[]> {
    const now = Date.now();
    const sessions = tutorId
      ? await this.findAllBy('tutorId', tutorId)
      : studentId
        ? await this.findAllBy('studentId', studentId)
        : await this.findAllBy('status', TutoringSessionStatus.SCHEDULED);

    const upcoming = this.sortByScheduledDate(
      sessions.filter(s => s.status === TutoringSessionStatus.SCHEDULED && s.scheduledDate.getTime() > now),
      'asc'
    );
    return limitCount ? upcoming.slice(0, limitCount) : upcoming;
  }

  /**
   * Finds overdue tutoring sessions (scheduled time has passed but not started)
   * @param tutorId Optional tutor filter
   * @returns Promise<TutoringSession[]> Array of overdue sessions
   */
  async findOverdue(tutorId?: string): Promise<TutoringSession[]> {
    const now = Date.now();
    const sessions = tutorId
      ? await this.findAllBy('tutorId', tutorId)
      : await this.findAllBy('status', TutoringSessionStatus.SCHEDULED);

    return this.sortByScheduledDate(
      sessions.filter(s => s.status === TutoringSessionStatus.SCHEDULED && s.scheduledDate.getTime() < now),
      'desc'
    );
  }

  /**
   * Finds sessions that conflict with a given time slot
   * @param tutorId The tutor's ID
   * @param scheduledDate The proposed session date
   * @param duration The session duration in minutes
   * @returns Promise<TutoringSession[]> Array of conflicting sessions
   */
  async findConflictingSessions(
    tutorId: string,
    scheduledDate: Date,
    duration: number
  ): Promise<TutoringSession[]> {
    const requestedStart = scheduledDate.getTime();
    const requestedEnd = requestedStart + (duration * 60000);
    const activeStatuses = [TutoringSessionStatus.SCHEDULED, TutoringSessionStatus.IN_PROGRESS];

    const sessions = await this.findAllBy('tutorId', tutorId);

    return sessions.filter(session => {
      if (!activeStatuses.includes(session.status)) {
        return false;
      }
      const existingStart = session.scheduledDate.getTime();
      const existingEnd = existingStart + (session.duration * 60000);
      return (requestedStart < existingEnd && existingStart < requestedEnd);
    });
  }

  private buildStats(sessions: TutoringSession[]): SessionStats {
    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === TutoringSessionStatus.COMPLETED).length,
      cancelledSessions: sessions.filter(s => s.status === TutoringSessionStatus.CANCELLED).length,
      noShowSessions: sessions.filter(s => s.status === TutoringSessionStatus.NO_SHOW).length,
      totalHours: sessions.reduce((total, session) => total + (session.duration / 60), 0),
      upcomingSessions: sessions.filter(s =>
        s.status === TutoringSessionStatus.SCHEDULED &&
        s.scheduledDate > new Date()
      ).length
    };
  }

  /**
   * Gets session statistics for a tutor
   * @param tutorId The tutor's ID
   * @param startDate Optional start date for the period
   * @param endDate Optional end date for the period
   * @returns Promise<SessionStats> Statistics object
   */
  async getSessionStats(
    tutorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SessionStats> {
    const sessions = await this.findAllBy('tutorId', tutorId);
    const inPeriod = startDate && endDate ? sessions.filter(s => this.isWithin(s, startDate, endDate)) : sessions;
    return this.buildStats(inPeriod);
  }

  /**
   * Gets session statistics for a student
   * @param studentId The student's ID
   * @param startDate Optional start date for the period
   * @param endDate Optional end date for the period
   * @returns Promise<SessionStats> Statistics object
   */
  async getStudentSessionStats(
    studentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SessionStats> {
    const sessions = await this.findAllBy('studentId', studentId);
    const inPeriod = startDate && endDate ? sessions.filter(s => this.isWithin(s, startDate, endDate)) : sessions;
    return this.buildStats(inPeriod);
  }

  /**
   * Deletes a tutoring session
   * @param id The session ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    const sessionRef = doc(firestore, this.collectionName, id);
    await deleteDoc(sessionRef);
  }

  /**
   * Checks if a session exists
   * @param id The session ID
   * @returns Promise<boolean> True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const sessionRef = doc(firestore, this.collectionName, id);
    const sessionDoc = await getDoc(sessionRef);
    return sessionDoc.exists();
  }
}
