import type { Event } from './Event';
import type { EventSubscriber } from './EventSubscriber';

/**
 * Interface for the event bus - central component for event-driven architecture
 * Provides publish/subscribe functionality for loose coupling between components
 */
export interface EventBus {
  /**
   * Publish an event to all interested subscribers
   * @param event The event to publish
   * @returns Promise that resolves when all subscribers have processed the event
   */
  publish(event: Event): Promise<void>;

  /**
   * Subscribe to events with a subscriber
   * @param subscriber The subscriber that will handle events
   */
  subscribe(subscriber: EventSubscriber): void;

  /**
   * Unsubscribe a subscriber from events
   * @param subscriber The subscriber to remove
   */
  unsubscribe(subscriber: EventSubscriber): void;

  /**
   * Get all subscribers for a specific event type
   * @param eventType The event type to check
   * @returns Array of subscribers interested in this event type
   */
  getSubscribers(eventType: string): EventSubscriber[];

  /**
   * Check if there are any subscribers for a specific event type
   * @param eventType The event type to check
   * @returns True if there are subscribers, false otherwise
   */
  hasSubscribers(eventType: string): boolean;
}