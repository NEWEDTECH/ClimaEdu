import { InstitutionAchievement } from '../../core/entities/InstitutionAchievement';

/**
 * Repository interface for managing institution-specific achievements
 */
export interface InstitutionAchievementRepository {
  /**
   * Generates a new unique ID for an institution achievement
   * @returns Promise that resolves to a unique ID
   */
  generateId(): Promise<string>;

  /**
   * Creates a new institution achievement
   * @param achievement The achievement to create
   * @returns Promise that resolves when the achievement is created
   */
  create(achievement: InstitutionAchievement): Promise<void>;

  /**
   * Updates an existing institution achievement
   * @param achievement The achievement to update
   * @returns Promise that resolves when the achievement is updated
   */
  update(achievement: InstitutionAchievement): Promise<void>;

  /**
   * Deletes an institution achievement
   * @param achievementId The ID of the achievement to delete
   * @param institutionId The institution ID (for security)
   * @returns Promise that resolves when the achievement is deleted
   */
  delete(achievementId: string, institutionId: string): Promise<void>;

  /**
   * Finds an institution achievement by ID
   * @param achievementId The achievement ID
   * @param institutionId The institution ID (for security)
   * @returns Promise that resolves to the achievement or null if not found
   */
  findById(achievementId: string, institutionId: string): Promise<InstitutionAchievement | null>;

  /**
   * Lists all achievements for a specific institution
   * @param institutionId The institution ID
   * @param options Pagination and filtering options
   * @returns Promise that resolves to a list of achievements
   */
  listByInstitution(
    institutionId: string,
    options?: {
      isActive?: boolean;
      limit?: number;
      offset?: number;
      orderBy?: 'createdAt' | 'updatedAt' | 'name';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<InstitutionAchievement[]>;

  /**
   * Counts achievements for a specific institution
   * @param institutionId The institution ID
   * @param isActive Filter by active status (optional)
   * @returns Promise that resolves to the count
   */
  countByInstitution(institutionId: string, isActive?: boolean): Promise<number>;

  /**
   * Finds achievements by criteria type for an institution
   * @param institutionId The institution ID
   * @param criteriaType The criteria type to filter by
   * @param isActive Filter by active status (optional)
   * @returns Promise that resolves to a list of achievements
   */
  findByCriteriaType(
    institutionId: string,
    criteriaType: string,
    isActive?: boolean
  ): Promise<InstitutionAchievement[]>;

  /**
   * Checks if an achievement name already exists for the institution
   * @param institutionId The institution ID
   * @param name The achievement name
   * @param excludeId Achievement ID to exclude from check (for updates)
   * @returns Promise that resolves to true if name exists
   */
  existsByName(institutionId: string, name: string, excludeId?: string): Promise<boolean>;

  /**
   * Finds achievements by institution ID (alias for listByInstitution)
   * @param institutionId The institution ID
   * @returns Promise that resolves to a list of active achievements
   */
  findByInstitutionId(institutionId: string): Promise<InstitutionAchievement[]>;
}