/**
 * StudentBadge
 * 
 * Persona: Student
 * Purpose: Records that a specific student has earned a specific badge.
 * 
 * Fields:
 * - id: Unique identifier for this student-badge relationship
 * - userId: Identifies the student who earned the badge
 * - badgeId: Identifies the badge that was earned
 * - institutionId: The institution context in which the badge was earned
 * - awardedAt: The date and time when the badge was awarded to the student
 */
export class StudentBadge {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly badgeId: string,
    readonly institutionId: string,
    readonly awardedAt: Date
  ) {}

  /**
   * Creates a new StudentBadge instance
   * @param params StudentBadge properties
   * @returns A new StudentBadge instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    userId: string;
    badgeId: string;
    institutionId: string;
    awardedAt?: Date;
  }): StudentBadge {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Student badge ID cannot be empty');
    }

    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.badgeId || params.badgeId.trim() === '') {
      throw new Error('Badge ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    // Default awardedAt to now if not provided
    const awardedAt = params.awardedAt || new Date();

    return new StudentBadge(
      params.id,
      params.userId,
      params.badgeId,
      params.institutionId,
      awardedAt
    );
  }

  /**
   * Checks if this badge was awarded recently
   * @param daysThreshold The number of days to consider as "recent"
   * @returns True if the badge was awarded within the specified number of days
   */
  public isRecentlyAwarded(daysThreshold: number = 7): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.awardedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  }

  /**
   * Gets the number of days since this badge was awarded
   * @returns The number of days since the badge was awarded
   */
  public getDaysSinceAwarded(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.awardedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
