import { injectable, inject } from 'inversify';
import type { StudentAchievementRepository } from '../../../infrastructure/repositories/StudentAchievementRepository';
import type { ListStudentAchievementsInput } from './list-student-achievements.input';
import type { ListStudentAchievementsOutput } from './list-student-achievements.output';
import { repositories } from '@/_core/shared/container/modules/achievement/symbols';

/**
 * Use case for listing achievements earned by a student
 */
@injectable()
export class ListStudentAchievementsUseCase {
  constructor(
    @inject(repositories.StudentAchievementRepository)
    private studentAchievementRepository: StudentAchievementRepository
  ) {}

  async execute(input: ListStudentAchievementsInput): Promise<ListStudentAchievementsOutput> {
    try {
      // Validate input
      if (!input.userId || input.userId.trim() === '') {
        return {
          achievements: [],
          total: 0,
          success: false,
          message: 'User ID is required'
        };
      }

      if (!input.institutionId || input.institutionId.trim() === '') {
        return {
          achievements: [],
          total: 0,
          success: false,
          message: 'Institution ID is required'
        };
      }

      // Get achievements from repository
      const achievements = await this.studentAchievementRepository.listByUser(
        input.userId,
        input.institutionId,
        {
          achievementType: input.achievementType,
          recentDays: input.recentDays,
          limit: input.limit,
          offset: input.offset,
          orderBy: 'awardedAt',
          orderDirection: 'desc'
        }
      );

      // Get total count
      const total = await this.studentAchievementRepository.countByUser(
        input.userId,
        input.institutionId,
        input.achievementType
      );

      return {
        achievements,
        total,
        success: true,
        message: 'Student achievements retrieved successfully'
      };

    } catch (error) {
      return {
        achievements: [],
        total: 0,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve student achievements'
      };
    }
  }
}