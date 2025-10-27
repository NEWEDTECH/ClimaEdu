/**
 * UserAccessHistory entity
 *
 * Represents the access history of a user within a specific institution.
 * Tracks consecutive days, total access days, and last access date.
 *
 * Following Clean Architecture principles, this entity contains business logic
 * for calculating consecutive days and is independent of infrastructure.
 */
export class UserAccessHistory {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly institutionId: string,
    public lastAccessDate: Date,
    public consecutiveDays: number,
    public totalAccessDays: number,
    readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new UserAccessHistory instance
   *
   * @param params UserAccessHistory properties
   * @returns A new UserAccessHistory instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    userId: string;
    institutionId: string;
    lastAccessDate: Date;
    consecutiveDays: number;
    totalAccessDays: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserAccessHistory {
    // Validate required fields
    if (!params.id || params.id.trim() === '') {
      throw new Error('UserAccessHistory ID is required and cannot be empty');
    }

    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID is required and cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID is required and cannot be empty');
    }

    if (!params.lastAccessDate || !(params.lastAccessDate instanceof Date)) {
      throw new Error('Last access date is required and must be a valid Date');
    }

    if (typeof params.consecutiveDays !== 'number' || params.consecutiveDays < 1) {
      throw new Error('Consecutive days must be a number greater than or equal to 1');
    }

    if (typeof params.totalAccessDays !== 'number' || params.totalAccessDays < 1) {
      throw new Error('Total access days must be a number greater than or equal to 1');
    }

    const now = new Date();

    return new UserAccessHistory(
      params.id,
      params.userId,
      params.institutionId,
      params.lastAccessDate,
      params.consecutiveDays,
      params.totalAccessDays,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Calculates new consecutive days based on today's date
   *
   * Business Logic:
   * - If last access was yesterday (consecutive): increment count
   * - If last access was earlier (streak broken): reset to 1
   * - If last access was today: should not call this (same day)
   *
   * @param today Today's date (midnight)
   * @returns New consecutive days count
   */
  private calculateNewConsecutiveDays(today: Date): number {
    // Normalize both dates to midnight for comparison
    const lastMidnight = new Date(
      this.lastAccessDate.getFullYear(),
      this.lastAccessDate.getMonth(),
      this.lastAccessDate.getDate()
    );

    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Calculate difference in days
    const daysDiff = Math.floor(
      (todayMidnight.getTime() - lastMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day - should not happen if caller checks properly
      return this.consecutiveDays;
    } else if (daysDiff === 1) {
      // Yesterday - consecutive access
      return this.consecutiveDays + 1;
    } else {
      // More than 1 day - streak broken
      return 1;
    }
  }

  /**
   * Records a new access for today
   *
   * Updates:
   * - lastAccessDate to today
   * - consecutiveDays (calculated based on last access)
   * - totalAccessDays (incremented)
   * - updatedAt timestamp
   *
   * @param today Today's date
   */
  public recordAccess(today: Date): void {
    // Normalize to midnight
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Calculate new consecutive days
    this.consecutiveDays = this.calculateNewConsecutiveDays(todayMidnight);

    // Update fields
    this.lastAccessDate = todayMidnight;
    this.totalAccessDays += 1;
    this.updatedAt = new Date();
  }

  /**
   * Checks if access was already recorded today
   *
   * @param today Today's date
   * @returns true if already accessed today, false otherwise
   */
  public wasAccessedToday(today: Date): boolean {
    const lastMidnight = new Date(
      this.lastAccessDate.getFullYear(),
      this.lastAccessDate.getMonth(),
      this.lastAccessDate.getDate()
    );

    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return lastMidnight.getTime() === todayMidnight.getTime();
  }

  /**
   * Gets the number of days since last access
   *
   * @param today Today's date
   * @returns Number of days since last access
   */
  public getDaysSinceLastAccess(today: Date): number {
    const lastMidnight = new Date(
      this.lastAccessDate.getFullYear(),
      this.lastAccessDate.getMonth(),
      this.lastAccessDate.getDate()
    );

    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return Math.floor(
      (todayMidnight.getTime() - lastMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
