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
  orderBy, 
  limit, 
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
    
    // Create and return a TutoringSession entity
    return TutoringSession.create({
      id: data.id,
      studentId: data.studentId,
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      courseId: data.courseId,
      scheduledDate,
      duration: data.duration,
      studentQuestion: data.studentQuestion,
      priority: data.priority || SessionPriority.MEDIUM,
      createdAt,
      updatedAt
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
      subjectId: session.subjectId,
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
      cancelReason: session.cancelReason || null
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

  /**
   * Finds all tutoring sessions for a specific student
   * @param studentId The student's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByStudentId(studentId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(
      sessionsRef, 
      where('studentId', '==', studentId),
      orderBy('scheduledDate', 'desc')
    );

    if (status) {
      q = query(
        sessionsRef,
        where('studentId', '==', studentId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds all tutoring sessions for a specific tutor
   * @param tutorId The tutor's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByTutorId(tutorId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(
      sessionsRef, 
      where('tutorId', '==', tutorId),
      orderBy('scheduledDate', 'desc')
    );

    if (status) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds all tutoring sessions for a specific subject
   * @param subjectId The subject's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findBySubjectId(subjectId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(
      sessionsRef, 
      where('subjectId', '==', subjectId),
      orderBy('scheduledDate', 'desc')
    );

    if (status) {
      q = query(
        sessionsRef,
        where('subjectId', '==', subjectId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds all tutoring sessions for a specific course
   * @param courseId The course's ID
   * @param status Optional status filter
   * @returns Promise<TutoringSession[]> Array of sessions
   */
  async findByCourseId(courseId: string, status?: TutoringSessionStatus): Promise<TutoringSession[]> {
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(
      sessionsRef, 
      where('courseId', '==', courseId),
      orderBy('scheduledDate', 'desc')
    );

    if (status) {
      q = query(
        sessionsRef,
        where('courseId', '==', courseId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
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
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(
      sessionsRef,
      where('scheduledDate', '>=', startDate),
      where('scheduledDate', '<=', endDate),
      orderBy('scheduledDate', 'asc')
    );

    if (tutorId) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate),
        orderBy('scheduledDate', 'asc')
      );
    } else if (studentId) {
      q = query(
        sessionsRef,
        where('studentId', '==', studentId),
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate),
        orderBy('scheduledDate', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
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
    const now = new Date();
    const sessionsRef = collection(firestore, this.collectionName);
    
    let q = query(
      sessionsRef,
      where('scheduledDate', '>', now),
      where('status', 'in', [TutoringSessionStatus.REQUESTED, TutoringSessionStatus.SCHEDULED]),
      orderBy('scheduledDate', 'asc')
    );

    if (tutorId) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('scheduledDate', '>', now),
        where('status', 'in', [TutoringSessionStatus.REQUESTED, TutoringSessionStatus.SCHEDULED]),
        orderBy('scheduledDate', 'asc')
      );
    } else if (studentId) {
      q = query(
        sessionsRef,
        where('studentId', '==', studentId),
        where('scheduledDate', '>', now),
        where('status', 'in', [TutoringSessionStatus.REQUESTED, TutoringSessionStatus.SCHEDULED]),
        orderBy('scheduledDate', 'asc')
      );
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
  }

  /**
   * Finds overdue tutoring sessions (scheduled time has passed but not started)
   * @param tutorId Optional tutor filter
   * @returns Promise<TutoringSession[]> Array of overdue sessions
   */
  async findOverdue(tutorId?: string): Promise<TutoringSession[]> {
    const now = new Date();
    const sessionsRef = collection(firestore, this.collectionName);
    
    let q = query(
      sessionsRef,
      where('scheduledDate', '<', now),
      where('status', '==', TutoringSessionStatus.SCHEDULED),
      orderBy('scheduledDate', 'desc')
    );

    if (tutorId) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('scheduledDate', '<', now),
        where('status', '==', TutoringSessionStatus.SCHEDULED),
        orderBy('scheduledDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });
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
    const sessionStart = scheduledDate;
    const sessionEnd = new Date(scheduledDate.getTime() + (duration * 60000));
    
    // Find sessions that might conflict (broader range)
    const dayStart = new Date(scheduledDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(scheduledDate);
    dayEnd.setHours(23, 59, 59, 999);

    const sessionsRef = collection(firestore, this.collectionName);
    const q = query(
      sessionsRef,
      where('tutorId', '==', tutorId),
      where('scheduledDate', '>=', dayStart),
      where('scheduledDate', '<=', dayEnd),
      where('status', 'in', [
        TutoringSessionStatus.REQUESTED,
        TutoringSessionStatus.SCHEDULED,
        TutoringSessionStatus.IN_PROGRESS
      ])
    );

    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });

    // Filter for actual conflicts
    return sessions.filter(session => {
      const existingStart = session.scheduledDate.getTime();
      const existingEnd = existingStart + (session.duration * 60000);
      const requestedStart = sessionStart.getTime();
      const requestedEnd = sessionEnd.getTime();

      return (requestedStart < existingEnd && existingStart < requestedEnd);
    });
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
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(sessionsRef, where('tutorId', '==', tutorId));

    if (startDate && endDate) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate)
      );
    }

    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });

    const stats: SessionStats = {
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

    return stats;
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
    const sessionsRef = collection(firestore, this.collectionName);
    let q = query(sessionsRef, where('studentId', '==', studentId));

    if (startDate && endDate) {
      q = query(
        sessionsRef,
        where('studentId', '==', studentId),
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate)
      );
    }

    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.mapToEntity({ id: doc.id, ...data });
    });

    const stats: SessionStats = {
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

    return stats;
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
