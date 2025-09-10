import type { Event } from '@/_core/shared/events/interfaces/Event';
import { nanoid } from 'nanoid';

/**
 * Event data for when a certificate is earned
 */
export interface CertificateEarnedEventData {
  userId: string;
  institutionId: string;
  certificateId: string;
  courseId: string;
  courseName: string;
  certificateType: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION';
  issuedDate: Date;
  validUntil?: Date;
  score?: number;
}

/**
 * Event fired when a student earns a certificate
 */
export class CertificateEarnedEvent implements Event {
  readonly eventType = 'CERTIFICATE_EARNED';
  readonly timestamp: Date;
  readonly eventId: string;
  readonly version = 1;
  readonly data: CertificateEarnedEventData;
  readonly metadata?: Record<string, any>;

  constructor(data: CertificateEarnedEventData, metadata?: Record<string, any>) {
    this.data = data;
    this.metadata = metadata;
    this.timestamp = new Date();
    this.eventId = nanoid();
  }

  /**
   * Static factory method for creating the event
   */
  static create(data: CertificateEarnedEventData, metadata?: Record<string, any>): CertificateEarnedEvent {
    return new CertificateEarnedEvent(data, metadata);
  }
}