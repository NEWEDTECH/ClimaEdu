/**
 * Base interface for all events in the system
 * Following Domain-Driven Design principles for event-driven architecture
 */
export interface Event {
  /**
   * Unique identifier for the event type
   * Should be in SCREAMING_SNAKE_CASE format (e.g., 'USER_REGISTERED', 'LESSON_COMPLETED')
   */
  readonly eventType: string;

  /**
   * Timestamp when the event occurred
   */
  readonly timestamp: Date;

  /**
   * Unique identifier for this event instance
   */
  readonly eventId: string;

  /**
   * Version of the event schema for future compatibility
   */
  readonly version: number;

  /**
   * Event-specific data payload
   * Each concrete event will define its own data structure
   */
  readonly data: Record<string, unknown>;

  /**
   * Optional metadata for tracing, correlation, etc.
   */
  readonly metadata?: Record<string, unknown>;
}