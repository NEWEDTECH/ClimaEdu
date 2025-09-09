import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for when a lesson is completed
 */
export interface LessonCompletedEventData {
  userId: string;
  institutionId: string;
  lessonId: string;
  moduleId: string;
  courseId: string;
  completionTime: number; // in seconds
  score?: number; // if applicable
}

/**
 * Event fired when a student completes a lesson
 */
export class LessonCompletedEvent implements Event {
  readonly eventType = 'LESSON_COMPLETED';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: LessonCompletedEventData;
  readonly metadata?: Record<string, any>;

  constructor(data: LessonCompletedEventData, metadata?: Record<string, any>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: LessonCompletedEventData, metadata?: Record<string, any>): LessonCompletedEvent {
    return new LessonCompletedEvent(data, metadata);
  }
}