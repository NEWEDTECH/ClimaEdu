import { InstitutionAchievement } from '../../entities/InstitutionAchievement';

export interface ListInstitutionAchievementsOutput {
  achievements: InstitutionAchievement[];
  total: number;
  success: boolean;
  message: string;
}