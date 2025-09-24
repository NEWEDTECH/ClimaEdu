import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for when a course is completed
 */
export interface CourseCompletedEventData {
  userId: string;
  institutionId: string;
  courseId: string;
  courseName: string;
  completionDate: Date;
  totalLessons: number;
  averageScore?: number;
  totalStudyTime: number; // in seconds
}

/**
 * Event fired when a student completes a course
 */
export class CourseCompletedEvent implements Event {
  readonly eventType = 'COURSE_COMPLETED';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: CourseCompletedEventData;
  readonly metadata?: Record<string, unknown>;

  constructor(data: CourseCompletedEventData, metadata?: Record<string, unknown>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: CourseCompletedEventData, metadata?: Record<string, unknown>): CourseCompletedEvent {
    return new CourseCompletedEvent(data, metadata);
  }
}