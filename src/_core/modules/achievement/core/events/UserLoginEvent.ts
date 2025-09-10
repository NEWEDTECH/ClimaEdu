import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for when a user logs in
 */
export interface UserLoginEventData {
  userId: string;
  institutionId: string;
  loginTime: Date;
  isFirstLogin: boolean;
  consecutiveLoginDays?: number;
  deviceInfo?: string;
  ipAddress?: string;
}

/**
 * Event fired when a user logs into the system
 */
export class UserLoginEvent implements Event {
  readonly eventType = 'USER_LOGIN';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: UserLoginEventData;
  readonly metadata?: Record<string, any>;

  constructor(data: UserLoginEventData, metadata?: Record<string, any>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: UserLoginEventData, metadata?: Record<string, any>): UserLoginEvent {
    return new UserLoginEvent(data, metadata);
  }
}