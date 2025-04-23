import { injectable, inject } from 'inversify';
import type { StudentBadgeRepository } from '../../../infrastructure/repositories/StudentBadgeRepository';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { Register } from '@/_core/shared/container';
import { ViewEarnedBadgesInput } from './view-earned-badges.input';
import { ViewEarnedBadgesOutput } from './view-earned-badges.output';

/**
 * Use case for viewing badges earned by a user
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class ViewEarnedBadgesUseCase {
  constructor(
    @inject(Register.badge.repository.StudentBadgeRepository)
    private studentBadgeRepository: StudentBadgeRepository,
    
    @inject(Register.user.repository.UserRepository)
    private userRepository: UserRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if user not found
   */
  async execute(input: ViewEarnedBadgesInput): Promise<ViewEarnedBadgesOutput> {
    // Verify that the user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    // Get all badges earned by the user with their details
    const earnedBadgesWithDetails = await this.studentBadgeRepository.getEarnedBadgesWithDetails(
      input.userId,
      input.institutionId
    );

    // Count recently earned badges (within the last 7 days)
    const recentlyEarned = earnedBadgesWithDetails.filter(
      ({ studentBadge }) => studentBadge.isRecentlyAwarded()
    ).length;

    return {
      earnedBadges: earnedBadgesWithDetails,
      totalEarned: earnedBadgesWithDetails.length,
      recentlyEarned
    };
  }
}
