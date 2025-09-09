import { useState, useEffect } from 'react';
import { container } from '@/_core/shared/container/container';
import { AchievementSymbols } from '@/_core/shared/container/modules/achievement/symbols';
import type { ListStudentAchievementsUseCase } from '@/_core/modules/achievement/core/use-cases/list-student-achievements/list-student-achievements.use-case';
import type { ListInstitutionAchievementsUseCase } from '@/_core/modules/achievement/core/use-cases/list-institution-achievements/list-institution-achievements.use-case';
import type { StudentAchievement } from '@/_core/modules/achievement/core/entities/StudentAchievement';
import type { InstitutionAchievement } from '@/_core/modules/achievement/core/entities/InstitutionAchievement';

interface AchievementWithProgress {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  criteriaType: string;
  criteriaValue: number;
  currentCount: number;
  awardedAt?: string;
  isAwarded: boolean;
  progressPercentage: number;
}

interface UseStudentAchievementsReturn {
  achievements: AchievementWithProgress[];
  awardedCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useStudentAchievements = (
  userId: string,
  institutionId: string
): UseStudentAchievementsReturn => {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listStudentAchievementsUseCase = container.get<ListStudentAchievementsUseCase>(
    AchievementSymbols.useCases.ListStudentAchievementsUseCase
  );

  const listInstitutionAchievementsUseCase = container.get<ListInstitutionAchievementsUseCase>(
    AchievementSymbols.useCases.ListInstitutionAchievementsUseCase
  );

  const loadAchievements = async () => {
    if (!userId || !institutionId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get all available achievements for the institution
      const institutionAchievements = await listInstitutionAchievementsUseCase.execute({
        institutionId,
        isActive: true,
        limit: 100
      });

      // Get student's earned achievements
      const studentAchievements = await listStudentAchievementsUseCase.execute({
        userId,
        institutionId,
        limit: 100
      });

      // Create a map of earned achievements for quick lookup
      const earnedMap = new Map<string, StudentAchievement>();
      studentAchievements.achievements.forEach(sa => {
        earnedMap.set(sa.achievementId, sa);
      });

      // Combine institution achievements with student progress
      const combinedAchievements: AchievementWithProgress[] = institutionAchievements.achievements.map(achievement => {
        const studentAchievement = earnedMap.get(achievement.id);
        
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          iconUrl: achievement.iconUrl || '/icons/achievements/default.svg',
          criteriaType: achievement.criteriaType,
          criteriaValue: achievement.criteriaValue,
          currentCount: studentAchievement?.progress || 0,
          awardedAt: studentAchievement?.awardedAt?.toISOString(),
          isAwarded: studentAchievement?.isCompleted || false,
          progressPercentage: studentAchievement ? 
            studentAchievement.getProgressPercentage(achievement.criteriaValue) : 0
        };
      });

      setAchievements(combinedAchievements);

    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [userId, institutionId]);

  const awardedCount = achievements.filter(a => a.isAwarded).length;
  const totalCount = achievements.length;

  return {
    achievements,
    awardedCount,
    totalCount,
    isLoading,
    error,
    refresh: loadAchievements
  };
};