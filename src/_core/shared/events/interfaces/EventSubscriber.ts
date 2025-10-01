import type { Event } from './Event';

/**
 * Interface for event subscribers in the system
 * Implements the Observer pattern for event-driven architecture
 */
export interface EventSubscriber {
  /**
   * Array of event types this subscriber is interested in
   * Should match the eventType property of events
   */
  readonly subscribedEventTypes: string[];

  /**
   * Handle an event
   * @param event The event to handle
   * @returns Promise that resolves when the event is processed
   * @throws Should handle all errors internally and not throw
   */
  handle(event: Event): Promise<void>;

  /**
   * Optional: Get subscriber identifier for logging/debugging
   */
  readonly subscriberId?: string;
}