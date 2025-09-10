import { StudentAchievement } from '../../entities/StudentAchievement';

export interface ListStudentAchievementsOutput {
  achievements: StudentAchievement[];
  total: number;
  success: boolean;
  message: string;
}