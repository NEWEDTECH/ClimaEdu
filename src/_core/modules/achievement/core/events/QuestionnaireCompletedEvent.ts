import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for when a questionnaire is completed
 */
export interface QuestionnaireCompletedEventData {
  userId: string;
  institutionId: string;
  questionnaireId: string;
  lessonId: string;
  moduleId: string;
  courseId: string;
  score: number; // percentage 0-100
  totalQuestions: number;
  correctAnswers: number;
  completionTime: number; // in seconds
  isPerfectScore: boolean; // 100% score
  isRetry: boolean;
  attemptNumber: number;
}

/**
 * Event fired when a student completes a questionnaire
 */
export class QuestionnaireCompletedEvent implements Event {
  readonly eventType = 'QUESTIONNAIRE_COMPLETED';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: QuestionnaireCompletedEventData;
  readonly metadata?: Record<string, any>;

  constructor(data: QuestionnaireCompletedEventData, metadata?: Record<string, any>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: QuestionnaireCompletedEventData, metadata?: Record<string, any>): QuestionnaireCompletedEvent {
    return new QuestionnaireCompletedEvent(data, metadata);
  }
}