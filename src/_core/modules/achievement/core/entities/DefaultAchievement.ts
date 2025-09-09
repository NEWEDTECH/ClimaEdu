import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

/**
 * DefaultAchievement
 * 
 * Persona: Platform Administrator
 * Purpose: Defines default achievements that come with the platform.
 * These achievements are available to all institutions and can be enabled/disabled.
 * 
 * Fields:
 * - id: Unique identifier for the achievement
 * - name: Display name of the achievement (e.g., "First Lesson")
 * - description: Detailed explanation of what the achievement represents
 * - iconUrl: URL to the achievement image for display in the UI
 * - criteriaType: What action triggers this achievement (e.g., lesson completion)
 * - criteriaValue: Number of actions needed to earn the achievement (e.g., 1 lesson)
 * - category: Category for grouping (e.g., "First Steps", "Progress", "Excellence")
 * - isGloballyEnabled: Whether this achievement is enabled by default for all institutions
 * - version: Version number for achievement updates
 * - createdAt: When the achievement was created
 * - updatedAt: When the achievement was last modified
 */
export class DefaultAchievement {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly iconUrl: string,
    readonly criteriaType: BadgeCriteriaType,
    readonly criteriaValue: number,
    readonly category: string,
    public isGloballyEnabled: boolean,
    readonly version: number,
    readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new DefaultAchievement instance
   * @param params Achievement properties
   * @returns A new DefaultAchievement instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    criteriaType: BadgeCriteriaType;
    criteriaValue: number;
    category: string;
    isGloballyEnabled?: boolean;
    version?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): DefaultAchievement {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Achievement ID cannot be empty');
    }

    if (!params.name || params.name.trim() === '') {
      throw new Error('Achievement name cannot be empty');
    }

    if (params.name.length > 100) {
      throw new Error('Achievement name cannot exceed 100 characters');
    }

    if (!params.description || params.description.trim() === '') {
      throw new Error('Achievement description cannot be empty');
    }

    if (params.description.length > 500) {
      throw new Error('Achievement description cannot exceed 500 characters');
    }

    if (!params.iconUrl || params.iconUrl.trim() === '') {
      throw new Error('Achievement icon URL cannot be empty');
    }

    if (!params.category || params.category.trim() === '') {
      throw new Error('Achievement category cannot be empty');
    }

    const validCategories = ['Primeiros Passos', 'Progresso', 'Engajamento', 'Excelência'];
    if (!validCategories.includes(params.category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate that criteriaType is a valid enum value
    if (!Object.values(BadgeCriteriaType).includes(params.criteriaType)) {
      throw new Error(`Invalid achievement criteria type: ${params.criteriaType}`);
    }

    if (params.criteriaValue <= 0) {
      throw new Error('Achievement criteria value must be greater than zero');
    }

    if (params.criteriaValue > 10000) {
      throw new Error('Achievement criteria value cannot exceed 10000');
    }

    const now = new Date();

    return new DefaultAchievement(
      params.id,
      params.name,
      params.description,
      params.iconUrl,
      params.criteriaType,
      params.criteriaValue,
      params.category,
      params.isGloballyEnabled ?? true,
      params.version ?? 1,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Checks if a given count meets the criteria for earning this achievement
   * @param count The count to check against the criteria value
   * @returns True if the count meets or exceeds the criteria value
   */
  public isCriteriaMet(count: number): boolean {
    return count >= this.criteriaValue;
  }

  /**
   * Gets the remaining count needed to earn this achievement
   * @param currentCount The current count
   * @returns The number of additional actions needed to earn the achievement
   */
  public getRemainingCount(currentCount: number): number {
    if (currentCount >= this.criteriaValue) {
      return 0;
    }
    return this.criteriaValue - currentCount;
  }

  /**
   * Gets the progress percentage towards earning this achievement
   * @param currentCount The current count
   * @returns The percentage of progress (0-100)
   */
  public getProgressPercentage(currentCount: number): number {
    if (currentCount >= this.criteriaValue) {
      return 100;
    }
    return Math.round((currentCount / this.criteriaValue) * 100);
  }

  /**
   * Enables this achievement globally
   */
  public enableGlobally(): void {
    this.isGloballyEnabled = true;
    this.updatedAt = new Date();
  }

  /**
   * Disables this achievement globally
   */
  public disableGlobally(): void {
    this.isGloballyEnabled = false;
    this.updatedAt = new Date();
  }

  /**
   * Checks if the achievement is globally enabled
   * @returns True if the achievement is globally enabled
   */
  public isEnabled(): boolean {
    return this.isGloballyEnabled;
  }

  /**
   * Creates a new version of this achievement with updated properties
   * @param updates Fields to update
   * @returns A new DefaultAchievement instance with incremented version
   */
  public createNewVersion(updates: {
    name?: string;
    description?: string;
    iconUrl?: string;
    criteriaType?: BadgeCriteriaType;
    criteriaValue?: number;
    category?: string;
    isGloballyEnabled?: boolean;
  }): DefaultAchievement {
    return DefaultAchievement.create({
      id: this.id,
      name: updates.name ?? this.name,
      description: updates.description ?? this.description,
      iconUrl: updates.iconUrl ?? this.iconUrl,
      criteriaType: updates.criteriaType ?? this.criteriaType,
      criteriaValue: updates.criteriaValue ?? this.criteriaValue,
      category: updates.category ?? this.category,
      isGloballyEnabled: updates.isGloballyEnabled ?? this.isGloballyEnabled,
      version: this.version + 1,
      createdAt: this.createdAt,
      updatedAt: new Date()
    });
  }
}