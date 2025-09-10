import { AchievementType } from '../../entities/StudentAchievement';

export interface ListStudentAchievementsInput {
  userId: string;
  institutionId: string;
  achievementType?: AchievementType;
  recentDays?: number;
  limit?: number;
  offset?: number;
}