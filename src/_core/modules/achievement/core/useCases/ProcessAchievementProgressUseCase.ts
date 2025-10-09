import { injectable, inject } from 'inversify';
import { AchievementSymbols } from '@/_core/shared/container/modules/achievement/symbols';
import type { InstitutionAchievementRepository } from '../../infrastructure/repositories/InstitutionAchievementRepository';
import type { StudentAchievementRepository } from '../../infrastructure/repositories/StudentAchievementRepository';
import type { InstitutionAchievement } from '../entities/InstitutionAchievement';
import { StudentAchievement, AchievementType } from '../entities/StudentAchievement';
import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

export interface ProcessAchievementProgressRequest {
  userId: string;
  institutionId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  eventTimestamp: Date;
}

/**
 * Use case responsible for processing achievement progress based on events
 * Checks if any achievements should be unlocked for a user
 */
@injectable()
export class ProcessAchievementProgressUseCase {
  constructor(
    @inject(AchievementSymbols.repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository,
    
    @inject(AchievementSymbols.repositories.StudentAchievementRepository)
    private studentAchievementRepository: StudentAchievementRepository
  ) {}

  async execute(request: ProcessAchievementProgressRequest): Promise<void> {
    const { userId, institutionId, eventType, eventData, eventTimestamp } = request;

    // Get all active achievements for this institution only
    const institutionAchievements = await this.institutionAchievementRepository.findByInstitutionId(institutionId);

    const allAchievements = institutionAchievements.filter(achievement => achievement.isActive);

    // Get current student achievements
    const studentAchievements = await this.studentAchievementRepository.findByUserId(userId);
    const earnedAchievementIds = new Set(
      studentAchievements.map(sa => sa.achievementId)
    );

    // Process each achievement that hasn't been earned yet
    const achievementsToCheck = allAchievements.filter(
      achievement => !earnedAchievementIds.has(achievement.id)
    );

    for (const achievement of achievementsToCheck) {
      try {
        if (await this.shouldProcessAchievement(achievement.criteriaType, eventType)) {
          const progress = await this.calculateProgress(achievement, eventData);
          
          // All achievements processed here are institution achievements
          const achievementType = AchievementType.INSTITUTION;
          
          if (progress.isCompleted) {
            // Achievement unlocked!
            const studentAchievementId = await this.studentAchievementRepository.generateId();
            const studentAchievement = StudentAchievement.create({
              id: studentAchievementId,
              userId,
              achievementId: achievement.id,
              institutionId,
              achievementType,
              awardedAt: eventTimestamp,
              progress: progress.currentValue,
              isCompleted: true
            });

            await this.studentAchievementRepository.save(studentAchievement);
            
            // Log achievement earned
            console.log(`🏆 Achievement unlocked: "${achievement.name}" for user ${userId}`);
            
            // Trigger notification in browser (if available)
            if (typeof window !== 'undefined') {
              try {
                // Import and call notification function
                const { showAchievementNotification } = await import('@/components/achievements/AchievementNotification');
                showAchievementNotification({
                  id: achievement.id,
                  name: achievement.name,
                  description: achievement.description,
                  iconUrl: achievement.iconUrl,
                  category: 'Progresso'
                });
              } catch (error) {
                console.warn('Could not show achievement notification:', error);
              }
            }
          } else {
            // Update progress if there's existing progress
            const existingProgress = await this.studentAchievementRepository.findByUserAndAchievement(userId, achievement.id, institutionId);
            
            if (existingProgress && progress.currentValue > existingProgress.progress) {
              existingProgress.updateProgress(progress.currentValue);
              await this.studentAchievementRepository.save(existingProgress);
            } else if (!existingProgress && progress.currentValue > 0) {
              // Create new progress record
              const studentAchievementId = await this.studentAchievementRepository.generateId();
              const studentAchievement = StudentAchievement.create({
                id: studentAchievementId,
                userId,
                achievementId: achievement.id,
                institutionId,
                achievementType,
                awardedAt: eventTimestamp,
                progress: progress.currentValue,
                isCompleted: false
              });

              await this.studentAchievementRepository.save(studentAchievement);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing achievement ${achievement.id} for user ${userId}:`, error);
        // Continue processing other achievements
      }
    }
  }

  private async shouldProcessAchievement(criteriaType: BadgeCriteriaType, eventType: string): Promise<boolean> {
    const eventMappings: Record<BadgeCriteriaType, string[]> = {
      [BadgeCriteriaType.STUDY_STREAK]: ['USER_LOGIN'],
      [BadgeCriteriaType.STUDY_TIME]: ['STUDY_SESSION_COMPLETED'],
      [BadgeCriteriaType.PERFECT_SCORE]: ['QUESTIONNAIRE_COMPLETED'],
      [BadgeCriteriaType.COURSE_COMPLETION]: ['COURSE_COMPLETED'],
      [BadgeCriteriaType.LESSON_COMPLETION]: ['LESSON_COMPLETED'],
      [BadgeCriteriaType.QUESTIONNAIRE_COMPLETION]: ['QUESTIONNAIRE_COMPLETED'],
      [BadgeCriteriaType.DAILY_LOGIN]: ['USER_LOGIN'],
      [BadgeCriteriaType.CERTIFICATE_ACHIEVED]: ['CERTIFICATE_EARNED'],
      [BadgeCriteriaType.PROFILE_COMPLETION]: ['PROFILE_COMPLETED'],
      [BadgeCriteriaType.RETRY_PERSISTENCE]: ['QUESTIONNAIRE_COMPLETED'],
      [BadgeCriteriaType.CONTENT_TYPE_DIVERSITY]: ['STUDY_SESSION_COMPLETED'],
      [BadgeCriteriaType.TRAIL_COMPLETION]: ['COURSE_COMPLETED'],
      [BadgeCriteriaType.FIRST_TIME_ACTIVITIES]: ['USER_LOGIN'],
      [BadgeCriteriaType.TIME_BASED_ACCESS]: ['USER_LOGIN']
    };

    const relevantEvents = eventMappings[criteriaType] || [];
    return relevantEvents.includes(eventType);
  }

  private async calculateProgress(
    achievement: InstitutionAchievement, 
    eventData: Record<string, unknown>
  ): Promise<{ currentValue: number; isCompleted: boolean }> {
    const criteriaValue = achievement.criteriaValue;
    
    // This is a simplified implementation
    // In a real system, you would query historical data to calculate accurate progress
    switch (achievement.criteriaType) {
      case BadgeCriteriaType.PERFECT_SCORE:
        const isPerfect = eventData.isPerfectScore === true || eventData.score === 100;
        return {
          currentValue: isPerfect ? criteriaValue : 0,
          isCompleted: isPerfect
        };

      case BadgeCriteriaType.COURSE_COMPLETION:
        return {
          currentValue: 1,
          isCompleted: true // Event already indicates completion
        };

      case BadgeCriteriaType.LESSON_COMPLETION:
        // Would need to count total lessons completed
        return {
          currentValue: 1,
          isCompleted: criteriaValue === 1
        };

      case BadgeCriteriaType.STUDY_TIME:
        const duration = typeof eventData.duration === 'number' ? eventData.duration : 
                        typeof eventData.completionTime === 'number' ? eventData.completionTime : 0;
        return {
          currentValue: duration,
          isCompleted: duration >= criteriaValue
        };

      case BadgeCriteriaType.QUESTIONNAIRE_COMPLETION:
        const score = typeof eventData.score === 'number' ? eventData.score : 0;
        return {
          currentValue: score,
          isCompleted: score >= criteriaValue
        };

      case BadgeCriteriaType.CERTIFICATE_ACHIEVED:
        return {
          currentValue: 1,
          isCompleted: true // Event already indicates certificate earned
        };

      case BadgeCriteriaType.PROFILE_COMPLETION:
        const completionPercentage = typeof eventData.completionPercentage === 'number' ? eventData.completionPercentage : 0;
        return {
          currentValue: completionPercentage,
          isCompleted: completionPercentage >= criteriaValue
        };

      case BadgeCriteriaType.DAILY_LOGIN:
        // Uses consecutiveLoginDays from UserLoginEvent
        const consecutiveDays = typeof eventData.consecutiveLoginDays === 'number'
          ? eventData.consecutiveLoginDays
          : 0;

        return {
          currentValue: consecutiveDays,
          isCompleted: consecutiveDays >= criteriaValue
        };

      case BadgeCriteriaType.STUDY_STREAK:
        // Uses consecutiveLoginDays from UserLoginEvent (same as DAILY_LOGIN)
        // Represents consecutive days of studying/accessing the platform
        const studyStreak = typeof eventData.consecutiveLoginDays === 'number'
          ? eventData.consecutiveLoginDays
          : 0;

        return {
          currentValue: studyStreak,
          isCompleted: studyStreak >= criteriaValue
        };

      case BadgeCriteriaType.FIRST_TIME_ACTIVITIES:
        // Uses isFirstLogin from UserLoginEvent
        const isFirstLogin = eventData.isFirstLogin === true;

        return {
          currentValue: isFirstLogin ? 1 : 0,
          isCompleted: isFirstLogin
        };

      case BadgeCriteriaType.TIME_BASED_ACCESS:
        // Uses loginTime from UserLoginEvent to check time of day
        const loginTime = eventData.loginTime instanceof Date
          ? eventData.loginTime
          : new Date(eventData.loginTime as string);

        const hour = loginTime.getHours();

        // Default implementation: considers any login time as valid
        // Institutions can customize criteriaValue to represent specific hours
        // For example: criteriaValue = 6 means "login between 6 AM and 7 AM"
        // For now, we'll just mark as completed when login happens
        return {
          currentValue: hour,
          isCompleted: true // Always complete on login for now
        };

      default:
        return {
          currentValue: 1,
          isCompleted: criteriaValue === 1
        };
    }
  }
}