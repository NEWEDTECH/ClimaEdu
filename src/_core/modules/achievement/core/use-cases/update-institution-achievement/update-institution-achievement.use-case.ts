import { injectable, inject } from 'inversify';
import type { InstitutionAchievementRepository } from '../../../infrastructure/repositories/InstitutionAchievementRepository';
import type { UpdateInstitutionAchievementInput } from './update-institution-achievement.input';
import type { UpdateInstitutionAchievementOutput } from './update-institution-achievement.output';
import { repositories } from '@/_core/shared/container/modules/achievement/symbols';
import type { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

/**
 * Use case for updating institution-specific achievements
 */
@injectable()
export class UpdateInstitutionAchievementUseCase {
  constructor(
    @inject(repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository
  ) {}

  async execute(input: UpdateInstitutionAchievementInput): Promise<UpdateInstitutionAchievementOutput> {
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

      // Get existing achievement
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

      // Check if name already exists (if name is being changed)
      if (input.name && input.name !== achievement.name) {
        const nameExists = await this.institutionAchievementRepository.existsByName(
          input.institutionId,
          input.name,
          input.achievementId
        );

        if (nameExists) {
          return {
            success: false,
            message: 'An achievement with this name already exists for this institution'
          };
        }
      }

      // Update achievement
      interface UpdateData {
        name?: string;
        description?: string;
        criteriaType?: BadgeCriteriaType;
        criteriaValue?: number;
        iconUrl?: string;
        isActive?: boolean;
      }

      const updateData: UpdateData = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.criteriaType !== undefined) updateData.criteriaType = input.criteriaType;
      if (input.criteriaValue !== undefined) updateData.criteriaValue = input.criteriaValue;
      if (input.iconUrl !== undefined) updateData.iconUrl = input.iconUrl;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      achievement.update(updateData);

      // Save to repository
      await this.institutionAchievementRepository.update(achievement);

      return {
        success: true,
        message: 'Institution achievement updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update institution achievement'
      };
    }
  }
}