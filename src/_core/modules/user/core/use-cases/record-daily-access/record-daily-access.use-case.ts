import { injectable, inject } from 'inversify';
import { UserSymbols } from '@/_core/shared/container/modules/user/symbols';
import { Register } from '@/_core/shared/container/symbols';
import type { EventBus } from '@/_core/shared/events/interfaces/EventBus';
import type { UserAccessHistoryRepository } from '../../../infrastructure/repositories/UserAccessHistoryRepository';
import { UserAccessHistory } from '../../entities/UserAccessHistory';
import { UserLoginEvent } from '@/_core/modules/achievement/core/events/UserLoginEvent';
import type { RecordDailyAccessInput } from './record-daily-access.input';
import type { RecordDailyAccessOutput } from './record-daily-access.output';

/**
 * Use case for recording daily user access
 *
 * This use case contains ALL business logic for daily access tracking:
 * 1. Retrieves access history from repository
 * 2. Calculates consecutive days (via entity business logic)
 * 3. Persists updated access history
 * 4. Publishes UserLoginEvent for achievement tracking
 *
 * Following Clean Architecture principles:
 * - Orchestrates domain entities and repositories
 * - Contains no infrastructure logic (delegated to repository)
 * - No direct Firebase/database access
 * - Publishes domain events via EventBus
 */
@injectable()
export class RecordDailyAccessUseCase {
  constructor(
    @inject(UserSymbols.repositories.UserAccessHistoryRepository)
    private accessHistoryRepository: UserAccessHistoryRepository,

    @inject(Register.shared.service.EventBus)
    private eventBus: EventBus
  ) {}

  /**
   * Executes the use case to record daily access
   *
   * Flow:
   * 1. Validate input
   * 2. Get/create access history from repository
   * 3. Check if already accessed today (skip if so)
   * 4. Update access history using entity business logic
   * 5. Persist changes via repository
   * 6. Publish UserLoginEvent
   *
   * @param input RecordDailyAccessInput containing userId and institutionId
   * @returns RecordDailyAccessOutput indicating success or failure
   */
  async execute(input: RecordDailyAccessInput): Promise<RecordDailyAccessOutput> {
    // Validate input
    this.validateInput(input);

    try {
      const today = new Date();
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      console.log('🚀 Recording daily access for user:', {
        userId: input.userId,
        institutionId: input.institutionId,
        date: todayMidnight.toISOString(),
        accessHistoryRepository: this.accessHistoryRepository
      });

      // 1. Retrieve access history from repository
      let accessHistory = await this.accessHistoryRepository.findByUserAndInstitution(
        input.userId,
        input.institutionId
      );

      console.log('🔍 Access history found:', accessHistory);

      let isFirstLogin = false;

      // 2. Create new access history if doesn't exist (first time)
      if (!accessHistory) {
        isFirstLogin = true;

        const id = await this.accessHistoryRepository.generateId();

        accessHistory = UserAccessHistory.create({
          id,
          userId: input.userId,
          institutionId: input.institutionId,
          lastAccessDate: todayMidnight,
          consecutiveDays: 1,
          totalAccessDays: 1
        });

        console.log('✨ First access for user in institution', {
          userId: input.userId,
          institutionId: input.institutionId
        });
      } else {
        // 3. Check if already accessed today
        if (accessHistory.wasAccessedToday(today)) {
          console.log('ℹ️  Already tracked today, skipping', {
            userId: input.userId,
            institutionId: input.institutionId
          });

          return {
            success: true,
            alreadyTrackedToday: true
          };
        }

        // 4. Record new access using entity business logic
        accessHistory.recordAccess(today);

        console.log('✅ Access recorded', {
          userId: input.userId,
          consecutiveDays: accessHistory.consecutiveDays,
          totalAccessDays: accessHistory.totalAccessDays
        });
      }

      // 5. Persist access history
      await this.accessHistoryRepository.save(accessHistory);

      // 6. Publish UserLoginEvent for achievement tracking
      const loginEvent = UserLoginEvent.create({
        userId: input.userId,
        institutionId: input.institutionId,
        loginTime: today,
        isFirstLogin,
        consecutiveLoginDays: accessHistory.consecutiveDays
      });

      await this.eventBus.publish(loginEvent);

      console.log('🎯 UserLoginEvent published', {
        userId: input.userId,
        institutionId: input.institutionId,
        consecutiveDays: accessHistory.consecutiveDays,
        isFirstLogin,
        eventId: loginEvent.eventId
      });

      return {
        success: true,
        eventId: loginEvent.eventId,
        consecutiveDays: accessHistory.consecutiveDays,
        totalAccessDays: accessHistory.totalAccessDays,
        isFirstLogin
      };
    } catch (error) {
      console.error('❌ Failed to record daily access:', error);

      return {
        success: false,
        error: error as Error
      };
    }
  }

  /**
   * Validates the input parameters
   *
   * @param input RecordDailyAccessInput to validate
   * @throws Error if validation fails
   */
  private validateInput(input: RecordDailyAccessInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('userId is required and cannot be empty');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('institutionId is required and cannot be empty');
    }
  }
}
