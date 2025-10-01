import { injectable, inject } from 'inversify';
import { nanoid } from 'nanoid';
import { InstitutionAchievement } from '../../entities/InstitutionAchievement';
import type { InstitutionAchievementRepository } from '../../../infrastructure/repositories/InstitutionAchievementRepository';
import type { CreateInstitutionAchievementInput } from './create-institution-achievement.input';
import type { CreateInstitutionAchievementOutput } from './create-institution-achievement.output';
import { repositories } from '@/_core/shared/container/modules/achievement/symbols';

/**
 * Use case for creating institution-specific achievements
 */
@injectable()
export class CreateInstitutionAchievementUseCase {
  constructor(
    @inject(repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository
  ) {}

  async execute(input: CreateInstitutionAchievementInput): Promise<CreateInstitutionAchievementOutput> {
    try {
      // Validate input
      if (!input.institutionId || input.institutionId.trim() === '') {
        return {
          id: '',
          success: false,
          message: 'Institution ID is required'
        };
      }

      if (!input.createdBy || input.createdBy.trim() === '') {
        return {
          id: '',
          success: false,
          message: 'Created by user ID is required'
        };
      }

      // Check if achievement name already exists for this institution
      const nameExists = await this.institutionAchievementRepository.existsByName(
        input.institutionId,
        input.name
      );

      if (nameExists) {
        return {
          id: '',
          success: false,
          message: 'An achievement with this name already exists for this institution'
        };
      }

      // Generate unique ID
      const achievementId = `inst_ach_${nanoid(10)}`;

      // Create the achievement entity
      const achievement = InstitutionAchievement.create({
        id: achievementId,
        institutionId: input.institutionId,
        name: input.name,
        description: input.description,
        iconUrl: input.iconUrl,
        criteriaType: input.criteriaType,
        criteriaValue: input.criteriaValue,
        isActive: input.isActive ?? true,
        createdBy: input.createdBy
      });

      // Save to repository
      await this.institutionAchievementRepository.create(achievement);

      return {
        id: achievementId,
        success: true,
        message: 'Institution achievement created successfully'
      };

    } catch (error) {
      return {
        id: '',
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create institution achievement'
      };
    }
  }
}