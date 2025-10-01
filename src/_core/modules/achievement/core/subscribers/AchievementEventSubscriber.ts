import { injectable, inject } from 'inversify';
import type { EventSubscriber } from '@/_core/shared/events/interfaces/EventSubscriber';
import type { Event } from '@/_core/shared/events/interfaces/Event';
import { AchievementSymbols } from '@/_core/shared/container/modules/achievement/symbols';
import type { ProcessAchievementProgressUseCase } from '../useCases/ProcessAchievementProgressUseCase';

/**
 * Subscriber that processes achievement-related events
 * Handles all events that could trigger achievement progress
 */
@injectable()
export class AchievementEventSubscriber implements EventSubscriber {
  readonly subscribedEventTypes = [
    'QUESTIONNAIRE_COMPLETED',
    'COURSE_COMPLETED', 
    'LESSON_COMPLETED',
    'USER_LOGIN',
    'STUDY_SESSION_COMPLETED',
    'CERTIFICATE_EARNED',
    'PROFILE_COMPLETED'
  ];

  readonly subscriberId = 'AchievementEventSubscriber';

  constructor(
    @inject(AchievementSymbols.useCases.ProcessAchievementProgress)
    private processAchievementProgressUseCase: ProcessAchievementProgressUseCase
  ) {}

  /**
   * Handles the incoming event by processing achievement progress
   */
  async handle(event: Event): Promise<void> {
    try {
      // Extract common data from all events
      const { userId, institutionId } = event.data as { userId: string; institutionId: string };

      if (!userId || !institutionId) {
        console.warn(`AchievementEventSubscriber: Missing userId or institutionId in event ${event.eventId}`);
        return;
      }

      // Process achievement progress for this event
      await this.processAchievementProgressUseCase.execute({
        userId,
        institutionId,
        eventType: event.eventType,
        eventData: event.data as Record<string, unknown>,
        eventTimestamp: event.timestamp
      });

    } catch (error) {
      console.error(`AchievementEventSubscriber: Error processing event ${event.eventId}:`, error);
      // Don't throw - we don't want to break other event processing
    }
  }

}
