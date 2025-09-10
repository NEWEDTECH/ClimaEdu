import { container } from './container';
import { SharedSymbols } from './symbols';
import { AchievementSymbols } from './modules/achievement/symbols';
import type { EventBus } from '../events/interfaces/EventBus';
import type { AchievementEventSubscriber } from '@/_core/modules/achievement/core/subscribers/AchievementEventSubscriber';

/**
 * Initialize all event subscribers by registering them with the EventBus
 * This should be called after all dependencies are registered in the container
 */
export function initializeSubscribers(): void {
  try {
    const eventBus = container.get<EventBus>(SharedSymbols.services.EventBus);
    
    // Register Achievement Event Subscriber
    const achievementSubscriber = container.get<AchievementEventSubscriber>(AchievementSymbols.subscribers.AchievementEventSubscriber);
    eventBus.subscribe(achievementSubscriber);
    
    console.log('Event subscribers initialized successfully');
  } catch (error) {
    console.error('Error initializing event subscribers:', error);
    throw error;
  }
}