import { injectable } from 'inversify';
import type { Event, EventBus, EventSubscriber } from '../interfaces';

/**
 * In-memory implementation of EventBus
 * Suitable for single-instance applications and testing
 * For distributed systems, consider Redis or message queue implementations
 */
@injectable()
export class InMemoryEventBus implements EventBus {
  private subscribers: Set<EventSubscriber> = new Set();

  async publish(event: Event): Promise<void> {
    console.log(`📣 Publishing event: ${event.eventType}`, event);
    const interestedSubscribers = this.getSubscribers(event.eventType);
    
    if (interestedSubscribers.length === 0) {
      // Optional: Log that no subscribers are listening
      console.debug(`No subscribers found for event type: ${event.eventType}`);
      return;
    }

    // Execute all subscribers in parallel
    const promises = interestedSubscribers.map(subscriber => 
      this.safelyExecuteSubscriber(subscriber, event)
    );

    await Promise.allSettled(promises);
  }

  subscribe(subscriber: EventSubscriber): void {
    this.subscribers.add(subscriber);
  }

  unsubscribe(subscriber: EventSubscriber): void {
    this.subscribers.delete(subscriber);
  }

  getSubscribers(eventType: string): EventSubscriber[] {
    return Array.from(this.subscribers).filter(subscriber =>
      subscriber.subscribedEventTypes.includes(eventType)
    );
  }

  hasSubscribers(eventType: string): boolean {
    return this.getSubscribers(eventType).length > 0;
  }

  /**
   * Safely execute a subscriber, catching and logging any errors
   * This prevents one failing subscriber from affecting others
   */
  private async safelyExecuteSubscriber(subscriber: EventSubscriber, event: Event): Promise<void> {
    try {
      await subscriber.handle(event);
    } catch (error) {
      // Log error but don't throw to prevent affecting other subscribers
      console.error(
        `Error in subscriber ${subscriber.subscriberId || 'unknown'} handling event ${event.eventType}:`,
        error
      );
    }
  }
}