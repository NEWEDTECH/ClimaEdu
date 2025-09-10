import { injectable, inject } from 'inversify';
import type { InstitutionAchievementRepository } from '../../../infrastructure/repositories/InstitutionAchievementRepository';
import type { ListInstitutionAchievementsInput } from './list-institution-achievements.input';
import type { ListInstitutionAchievementsOutput } from './list-institution-achievements.output';
import { repositories } from '@/_core/shared/container/modules/achievement/symbols';

/**
 * Use case for listing achievements of a specific institution
 */
@injectable()
export class ListInstitutionAchievementsUseCase {
  constructor(
    @inject(repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository
  ) {}

  async execute(input: ListInstitutionAchievementsInput): Promise<ListInstitutionAchievementsOutput> {
    try {
      // Validate input
      if (!input.institutionId || input.institutionId.trim() === '') {
        return {
          achievements: [],
          total: 0,
          success: false,
          message: 'Institution ID is required'
        };
      }

      // Get achievements from repository
      const achievements = await this.institutionAchievementRepository.listByInstitution(
        input.institutionId,
        {
          isActive: input.isActive,
          limit: input.limit,
          offset: input.offset,
          orderBy: input.orderBy,
          orderDirection: input.orderDirection
        }
      );

      // Get total count
      const total = await this.institutionAchievementRepository.countByInstitution(
        input.institutionId,
        input.isActive
      );

      return {
        achievements,
        total,
        success: true,
        message: 'Institution achievements retrieved successfully'
      };

    } catch (error) {
      return {
        achievements: [],
        total: 0,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve institution achievements'
      };
    }
  }
}