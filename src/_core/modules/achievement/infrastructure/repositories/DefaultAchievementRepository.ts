import { DefaultAchievement } from '../../core/entities/DefaultAchievement';

/**
 * Repository interface for managing default platform achievements
 */
export interface DefaultAchievementRepository {
  /**
   * Creates a new default achievement
   * @param achievement The achievement to create
   * @returns Promise that resolves when the achievement is created
   */
  create(achievement: DefaultAchievement): Promise<void>;

  /**
   * Updates an existing default achievement
   * @param achievement The achievement to update
   * @returns Promise that resolves when the achievement is updated
   */
  update(achievement: DefaultAchievement): Promise<void>;

  /**
   * Finds a default achievement by ID
   * @param achievementId The achievement ID
   * @returns Promise that resolves to the achievement or null if not found
   */
  findById(achievementId: string): Promise<DefaultAchievement | null>;

  /**
   * Lists all default achievements
   * @param options Filtering and pagination options
   * @returns Promise that resolves to a list of achievements
   */
  listAll(options?: {
    isGloballyEnabled?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'name' | 'category';
    orderDirection?: 'asc' | 'desc';
  }): Promise<DefaultAchievement[]>;

  /**
   * Lists achievements by category
   * @param category The achievement category
   * @param isGloballyEnabled Filter by globally enabled status (optional)
   * @returns Promise that resolves to a list of achievements
   */
  listByCategory(category: string, isGloballyEnabled?: boolean): Promise<DefaultAchievement[]>;

  /**
   * Finds achievements by criteria type
   * @param criteriaType The criteria type to filter by
   * @param isGloballyEnabled Filter by globally enabled status (optional)
   * @returns Promise that resolves to a list of achievements
   */
  findByCriteriaType(criteriaType: string, isGloballyEnabled?: boolean): Promise<DefaultAchievement[]>;

  /**
   * Gets all available categories
   * @returns Promise that resolves to a list of unique categories
   */
  getCategories(): Promise<string[]>;

  /**
   * Counts total default achievements
   * @param isGloballyEnabled Filter by globally enabled status (optional)
   * @returns Promise that resolves to the count
   */
  count(isGloballyEnabled?: boolean): Promise<number>;

  /**
   * Checks if an achievement name already exists
   * @param name The achievement name
   * @param excludeId Achievement ID to exclude from check (for updates)
   * @returns Promise that resolves to true if name exists
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Bulk creates default achievements (used for seeding)
   * @param achievements Array of achievements to create
   * @returns Promise that resolves when all achievements are created
   */
  bulkCreate(achievements: DefaultAchievement[]): Promise<void>;
}