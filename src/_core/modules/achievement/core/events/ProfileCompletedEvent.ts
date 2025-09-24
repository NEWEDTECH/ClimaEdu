import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for when a user completes their profile
 */
export interface ProfileCompletedEventData {
  userId: string;
  institutionId: string;
  completionPercentage: number; // 0-100
  completedFields: string[];
  missingFields: string[];
  isFirstTimeCompletion: boolean;
  profileSections: {
    personal: boolean;
    academic: boolean;
    preferences: boolean;
    avatar: boolean;
  };
}

/**
 * Event fired when a user completes their profile
 */
export class ProfileCompletedEvent implements Event {
  readonly eventType = 'PROFILE_COMPLETED';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: ProfileCompletedEventData;
  readonly metadata?: Record<string, unknown>;

  constructor(data: ProfileCompletedEventData, metadata?: Record<string, unknown>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: ProfileCompletedEventData, metadata?: Record<string, unknown>): ProfileCompletedEvent {
    return new ProfileCompletedEvent(data, metadata);
  }
}
