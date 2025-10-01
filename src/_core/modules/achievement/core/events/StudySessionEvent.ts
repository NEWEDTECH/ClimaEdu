import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for study session tracking
 */
export interface StudySessionEventData {
  userId: string;
  institutionId: string;
  sessionId: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  sessionType: 'LESSON' | 'READING' | 'VIDEO' | 'ACTIVITY' | 'QUIZ';
  isCompleted: boolean;
}

/**
 * Event fired when a user completes a study session
 */
export class StudySessionEvent implements Event {
  readonly eventType = 'STUDY_SESSION_COMPLETED';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: StudySessionEventData;
  readonly metadata?: Record<string, unknown>;

  constructor(data: StudySessionEventData, metadata?: Record<string, unknown>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: StudySessionEventData, metadata?: Record<string, unknown>): StudySessionEvent {
    return new StudySessionEvent(data, metadata);
  }
}
