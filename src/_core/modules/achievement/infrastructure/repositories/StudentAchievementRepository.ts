import { StudentAchievement, AchievementType } from '../../core/entities/StudentAchievement';

/**
 * Repository interface for managing student achievements
 */
export interface StudentAchievementRepository {
  /**
   * Awards an achievement to a student
   * @param studentAchievement The student achievement to create
   * @returns Promise that resolves when the achievement is awarded
   */
  award(studentAchievement: StudentAchievement): Promise<void>;

  /**
   * Finds a specific student achievement
   * @param userId The student user ID
   * @param achievementId The achievement ID
   * @param institutionId The institution ID
   * @returns Promise that resolves to the student achievement or null if not found
   */
  findByUserAndAchievement(
    userId: string,
    achievementId: string,
    institutionId: string
  ): Promise<StudentAchievement | null>;

  /**
   * Lists all achievements earned by a specific student
   * @param userId The student user ID
   * @param institutionId The institution ID
   * @param options Filtering and pagination options
   * @returns Promise that resolves to a list of student achievements
   */
  listByUser(
    userId: string,
    institutionId: string,
    options?: {
      achievementType?: AchievementType;
      recentDays?: number;
      limit?: number;
      offset?: number;
      orderBy?: 'awardedAt' | 'achievementId';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<StudentAchievement[]>;

  /**
   * Lists students who have earned a specific achievement
   * @param achievementId The achievement ID
   * @param institutionId The institution ID
   * @param options Filtering and pagination options
   * @returns Promise that resolves to a list of student achievements
   */
  listByAchievement(
    achievementId: string,
    institutionId: string,
    options?: {
      recentDays?: number;
      limit?: number;
      offset?: number;
      orderBy?: 'awardedAt' | 'userId';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<StudentAchievement[]>;

  /**
   * Counts achievements earned by a student
   * @param userId The student user ID
   * @param institutionId The institution ID
   * @param achievementType Filter by achievement type (optional)
   * @returns Promise that resolves to the count
   */
  countByUser(userId: string, institutionId: string, achievementType?: AchievementType): Promise<number>;

  /**
   * Counts students who have earned a specific achievement
   * @param achievementId The achievement ID
   * @param institutionId The institution ID
   * @returns Promise that resolves to the count
   */
  countByAchievement(achievementId: string, institutionId: string): Promise<number>;

  /**
   * Checks if a student has already earned a specific achievement
   * @param userId The student user ID
   * @param achievementId The achievement ID
   * @param institutionId The institution ID
   * @returns Promise that resolves to true if the student has the achievement
   */
  hasAchievement(userId: string, achievementId: string, institutionId: string): Promise<boolean>;

  /**
   * Gets recent achievements for a student (for notifications)
   * @param userId The student user ID
   * @param institutionId The institution ID
   * @param hoursBack Number of hours to look back (default 24)
   * @returns Promise that resolves to a list of recent achievements
   */
  getRecentAchievements(
    userId: string,
    institutionId: string,
    hoursBack?: number
  ): Promise<StudentAchievement[]>;

  /**
   * Gets achievement statistics for an institution
   * @param institutionId The institution ID
   * @returns Promise that resolves to achievement statistics
   */
  getInstitutionStats(institutionId: string): Promise<{
    totalAwarded: number;
    uniqueStudents: number;
    mostEarnedAchievements: Array<{
      achievementId: string;
      count: number;
    }>;
    recentAwards: number; // last 7 days
  }>;

  /**
   * Gets top performing students by achievement count
   * @param institutionId The institution ID
   * @param limit Number of top students to return
   * @returns Promise that resolves to top students
   */
  getTopStudents(institutionId: string, limit?: number): Promise<Array<{
    userId: string;
    achievementCount: number;
    recentCount: number; // last 30 days
  }>>;

  /**
   * Removes an achievement from a student (rare operation, for corrections)
   * @param userId The student user ID
   * @param achievementId The achievement ID
   * @param institutionId The institution ID
   * @returns Promise that resolves when the achievement is removed
   */
  remove(userId: string, achievementId: string, institutionId: string): Promise<void>;

  /**
   * Bulk awards achievements to multiple students
   * @param studentAchievements Array of student achievements to award
   * @returns Promise that resolves when all achievements are awarded
   */
  bulkAward(studentAchievements: StudentAchievement[]): Promise<void>;
}