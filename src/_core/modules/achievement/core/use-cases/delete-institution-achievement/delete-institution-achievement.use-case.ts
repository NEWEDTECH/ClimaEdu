import { injectable, inject } from 'inversify';
import type { InstitutionAchievementRepository } from '../../../infrastructure/repositories/InstitutionAchievementRepository';
import type { DeleteInstitutionAchievementInput } from './delete-institution-achievement.input';
import type { DeleteInstitutionAchievementOutput } from './delete-institution-achievement.output';
import { repositories } from '@/_core/shared/container/modules/achievement/symbols';

/**
 * Use case for deleting institution-specific achievements
 */
@injectable()
export class DeleteInstitutionAchievementUseCase {
  constructor(
    @inject(repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository
  ) {}

  async execute(input: DeleteInstitutionAchievementInput): Promise<DeleteInstitutionAchievementOutput> {
    try {
      // Validate input
      if (!input.achievementId || input.achievementId.trim() === '') {
        return {
          success: false,
          message: 'Achievement ID is required'
        };
      }

      if (!input.institutionId || input.institutionId.trim() === '') {
        return {
          success: false,
          message: 'Institution ID is required'
        };
      }

      // Check if achievement exists
      const achievement = await this.institutionAchievementRepository.findById(
        input.achievementId,
        input.institutionId
      );

      if (!achievement) {
        return {
          success: false,
          message: 'Achievement not found'
        };
      }

      // Delete achievement
      await this.institutionAchievementRepository.delete(input.achievementId, input.institutionId);

      return {
        success: true,
        message: 'Institution achievement deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete institution achievement'
      };
    }
  }
}