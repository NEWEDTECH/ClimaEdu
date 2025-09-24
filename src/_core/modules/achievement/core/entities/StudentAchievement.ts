/**
 * StudentAchievement
 * 
 * Persona: Student
 * Purpose: Records that a specific student has earned a specific achievement.
 * This can be either a default platform achievement or an institution-specific achievement.
 * 
 * Fields:
 * - id: Unique identifier for this student-achievement relationship
 * - userId: Identifies the student who earned the achievement
 * - achievementId: Identifies the achievement that was earned
 * - institutionId: The institution context in which the achievement was earned
 * - achievementType: Whether this is a default or institution-specific achievement
 * - awardedAt: The date and time when the achievement was awarded to the student
 * - metadata: Additional data about how the achievement was earned (optional)
 */

export enum AchievementType {
  DEFAULT = 'DEFAULT',
  INSTITUTION = 'INSTITUTION',
}

export interface AchievementMetadata {
  [key: string]: unknown;
  triggerEvent?: string;
  finalCount?: number;
  completedAt?: string;
}

export class StudentAchievement {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly achievementId: string,
    readonly institutionId: string,
    readonly achievementType: AchievementType,
    readonly awardedAt: Date,
    public progress: number,
    public isCompleted: boolean,
    readonly metadata?: AchievementMetadata
  ) {}

  /**
   * Creates a new StudentAchievement instance
   * @param params StudentAchievement properties
   * @returns A new StudentAchievement instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    userId: string;
    achievementId: string;
    institutionId: string;
    achievementType: AchievementType;
    awardedAt?: Date;
    progress?: number;
    isCompleted?: boolean;
    metadata?: AchievementMetadata;
  }): StudentAchievement {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Student achievement ID cannot be empty');
    }

    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.achievementId || params.achievementId.trim() === '') {
      throw new Error('Achievement ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    // Validate that achievementType is a valid enum value
    if (!Object.values(AchievementType).includes(params.achievementType)) {
      throw new Error(`Invalid achievement type: ${params.achievementType}`);
    }

    // Default awardedAt to now if not provided
    const awardedAt = params.awardedAt || new Date();

    return new StudentAchievement(
      params.id,
      params.userId,
      params.achievementId,
      params.institutionId,
      params.achievementType,
      awardedAt,
      params.progress || 0,
      params.isCompleted || false,
      params.metadata
    );
  }

  /**
   * Checks if this achievement was awarded recently
   * @param daysThreshold The number of days to consider as "recent"
   * @returns True if the achievement was awarded within the specified number of days
   */
  public isRecentlyAwarded(daysThreshold: number = 7): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.awardedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  }

  /**
   * Gets the number of days since this achievement was awarded
   * @returns The number of days since the achievement was awarded
   */
  public getDaysSinceAwarded(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.awardedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets the number of hours since this achievement was awarded
   * @returns The number of hours since the achievement was awarded
   */
  public getHoursSinceAwarded(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.awardedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Checks if this is a default platform achievement
   * @returns True if this is a default achievement
   */
  public isDefaultAchievement(): boolean {
    return this.achievementType === AchievementType.DEFAULT;
  }

  /**
   * Checks if this is an institution-specific achievement
   * @returns True if this is an institution achievement
   */
  public isInstitutionAchievement(): boolean {
    return this.achievementType === AchievementType.INSTITUTION;
  }

  /**
   * Gets a specific metadata value
   * @param key The metadata key
   * @returns The metadata value or undefined if not found
   */
  public getMetadata<T = unknown>(key: string): T | undefined {
    return this.metadata?.[key] as T;
  }

  /**
   * Checks if metadata exists
   * @returns True if metadata is present
   */
  public hasMetadata(): boolean {
    return this.metadata !== undefined && Object.keys(this.metadata).length > 0;
  }

  /**
   * Gets the trigger event from metadata
   * @returns The trigger event name or undefined
   */
  public getTriggerEvent(): string | undefined {
    return this.getMetadata<string>('triggerEvent');
  }

  /**
   * Gets the final count from metadata (for incremental achievements)
   * @returns The final count or undefined
   */
  public getFinalCount(): number | undefined {
    return this.getMetadata<number>('finalCount');
  }

  /**
   * Creates a copy with additional metadata
   * @param additionalMetadata Metadata to add
   * @returns A new StudentAchievement instance with merged metadata
   */
  public withMetadata(additionalMetadata: AchievementMetadata): StudentAchievement {
    const mergedMetadata = {
      ...this.metadata,
      ...additionalMetadata
    };

    return new StudentAchievement(
      this.id,
      this.userId,
      this.achievementId,
      this.institutionId,
      this.achievementType,
      this.awardedAt,
      this.progress,
      this.isCompleted,
      mergedMetadata
    );
  }

  /**
   * Updates the progress for this achievement
   * @param newProgress The new progress value (0-100 or achievement criteria value)
   */
  public updateProgress(newProgress: number): void {
    if (newProgress < 0) {
      throw new Error('Progress cannot be negative');
    }
    
    this.progress = newProgress;
  }

  /**
   * Marks this achievement as completed
   */
  public markCompleted(): void {
    this.isCompleted = true;
  }

  /**
   * Gets the progress percentage (0-100)
   * @param maxValue The maximum value for this achievement (criteria value)
   * @returns Progress percentage
   */
  public getProgressPercentage(maxValue: number): number {
    if (maxValue === 0) return 0;
    return Math.round((this.progress / maxValue) * 100);
  }
}