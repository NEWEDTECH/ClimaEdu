import { injectable, inject } from 'inversify';
import type { InstitutionAchievementRepository } from '../../../infrastructure/repositories/InstitutionAchievementRepository';
import type { GetInstitutionAchievementInput } from './get-institution-achievement.input';
import type { GetInstitutionAchievementOutput } from './get-institution-achievement.output';
import { repositories } from '@/_core/shared/container/modules/achievement/symbols';

/**
 * Use case for getting a specific institution achievement
 */
@injectable()
export class GetInstitutionAchievementUseCase {
  constructor(
    @inject(repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository
  ) {}

  async execute(input: GetInstitutionAchievementInput): Promise<GetInstitutionAchievementOutput> {
    try {
      // Validate input
      if (!input.achievementId || input.achievementId.trim() === '') {
        return {
          achievement: null,
          success: false,
          message: 'Achievement ID is required'
        };
      }

      if (!input.institutionId || input.institutionId.trim() === '') {
        return {
          achievement: null,
          success: false,
          message: 'Institution ID is required'
        };
      }

      // Get achievement from repository
      const achievement = await this.institutionAchievementRepository.findById(
        input.achievementId,
        input.institutionId
      );

      if (!achievement) {
        return {
          achievement: null,
          success: false,
          message: 'Achievement not found'
        };
      }

      return {
        achievement,
        success: true,
        message: 'Institution achievement retrieved successfully'
      };

    } catch (error) {
      return {
        achievement: null,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve institution achievement'
      };
    }
  }
}