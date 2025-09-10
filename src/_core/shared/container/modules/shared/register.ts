import { Container } from 'inversify';
import { services } from './symbols';

// Import implementations
import type { EventBus } from '../../../events/interfaces/EventBus';
import { InMemoryEventBus } from '../../../events/implementations/InMemoryEventBus';

/**
 * Register shared services dependencies
 * @param container The DI container
 */
export function registerSharedModule(container: Container): void {
  // Register EventBus as singleton
  container.bind<EventBus>(services.EventBus).to(InMemoryEventBus).inSingletonScope();
}