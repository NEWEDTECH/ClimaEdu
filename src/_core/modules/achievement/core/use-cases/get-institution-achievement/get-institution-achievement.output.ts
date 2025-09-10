import { InstitutionAchievement } from '../../entities/InstitutionAchievement';

export interface GetInstitutionAchievementOutput {
  achievement: InstitutionAchievement | null;
  success: boolean;
  message: string;
}