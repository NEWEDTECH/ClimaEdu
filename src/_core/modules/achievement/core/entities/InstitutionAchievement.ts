import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

/**
 * InstitutionAchievement
 * 
 * Persona: Institution Admin
 * Purpose: Defines a custom achievement that can be created by institution administrators.
 * 
 * Fields:
 * - id: Unique identifier for the achievement
 * - institutionId: The institution that owns this achievement
 * - name: Display name of the achievement (e.g., "Reading Champion")
 * - description: Detailed explanation of what the achievement represents
 * - iconUrl: URL to the achievement image for display in the UI
 * - criteriaType: What action triggers this achievement (e.g., lesson completion)
 * - criteriaValue: Number of actions needed to earn the achievement (e.g., 10 lessons)
 * - isActive: Whether this achievement is currently active
 * - createdAt: When the achievement was created
 * - updatedAt: When the achievement was last modified
 * - createdBy: User ID who created this achievement
 */
export class InstitutionAchievement {
  private constructor(
    readonly id: string,
    readonly institutionId: string,
    readonly name: string,
    readonly description: string,
    readonly iconUrl: string,
    readonly criteriaType: BadgeCriteriaType,
    readonly criteriaValue: number,
    public isActive: boolean,
    readonly createdAt: Date,
    public updatedAt: Date,
    readonly createdBy: string
  ) {}

  /**
   * Creates a new InstitutionAchievement instance
   * @param params Achievement properties
   * @returns A new InstitutionAchievement instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    institutionId: string;
    name: string;
    description: string;
    iconUrl: string;
    criteriaType: BadgeCriteriaType;
    criteriaValue: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: string;
  }): InstitutionAchievement {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Achievement ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
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

    if (!params.createdBy || params.createdBy.trim() === '') {
      throw new Error('Created by user ID cannot be empty');
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

    return new InstitutionAchievement(
      params.id,
      params.institutionId,
      params.name,
      params.description,
      params.iconUrl,
      params.criteriaType,
      params.criteriaValue,
      params.isActive ?? true,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.createdBy
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
   * Updates the achievement details
   * @param updates Fields to update
   */
  public update(updates: {
    name?: string;
    description?: string;
    iconUrl?: string;
    criteriaType?: BadgeCriteriaType;
    criteriaValue?: number;
    isActive?: boolean;
  }): void {
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim() === '') {
        throw new Error('Achievement name cannot be empty');
      }
      if (updates.name.length > 100) {
        throw new Error('Achievement name cannot exceed 100 characters');
      }
    }

    if (updates.description !== undefined) {
      if (!updates.description || updates.description.trim() === '') {
        throw new Error('Achievement description cannot be empty');
      }
      if (updates.description.length > 500) {
        throw new Error('Achievement description cannot exceed 500 characters');
      }
    }

    if (updates.iconUrl !== undefined) {
      if (!updates.iconUrl || updates.iconUrl.trim() === '') {
        throw new Error('Achievement icon URL cannot be empty');
      }
    }

    if (updates.criteriaType !== undefined) {
      if (!Object.values(BadgeCriteriaType).includes(updates.criteriaType)) {
        throw new Error(`Invalid achievement criteria type: ${updates.criteriaType}`);
      }
    }

    if (updates.criteriaValue !== undefined) {
      if (updates.criteriaValue <= 0) {
        throw new Error('Achievement criteria value must be greater than zero');
      }
      if (updates.criteriaValue > 10000) {
        throw new Error('Achievement criteria value cannot exceed 10000');
      }
    }

    // Apply updates (using Object.assign to maintain immutability principles)
    Object.assign(this, updates, { updatedAt: new Date() });
  }

  /**
   * Activates the achievement
   */
  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivates the achievement
   */
  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Checks if the achievement is currently active
   * @returns True if the achievement is active
   */
  public isCurrentlyActive(): boolean {
    return this.isActive;
  }
}