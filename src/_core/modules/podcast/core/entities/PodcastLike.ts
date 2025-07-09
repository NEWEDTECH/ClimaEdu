/**
 * PodcastLike entity representing a like action for a podcast by a user
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class PodcastLike {
  private constructor(
    readonly id: string,
    readonly podcastId: string,
    readonly userId: string,
    readonly institutionId: string,
    readonly likedAt: Date
  ) {}

  /**
   * Creates a new PodcastLike instance
   * @param params PodcastLike properties
   * @returns A new PodcastLike instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    podcastId: string;
    userId: string;
    institutionId: string;
    likedAt?: Date;
  }): PodcastLike {
    if (!params.podcastId || params.podcastId.trim() === '') {
      throw new Error('Podcast ID cannot be empty');
    }

    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    return new PodcastLike(
      params.id,
      params.podcastId,
      params.userId,
      params.institutionId,
      params.likedAt ?? new Date()
    );
  }

  /**
   * Checks if this like is recent based on the provided threshold
   * @param hoursThreshold Number of hours to consider as recent
   * @returns True if the like is within the threshold, false otherwise
   */
  public isRecentLike(hoursThreshold: number): boolean {
    if (hoursThreshold <= 0) {
      throw new Error('Hours threshold must be positive');
    }

    const now = new Date();
    const thresholdMs = hoursThreshold * 60 * 60 * 1000; // Convert hours to milliseconds
    const timeDifference = now.getTime() - this.likedAt.getTime();

    return timeDifference <= thresholdMs;
  }

  /**
   * Gets the time elapsed since the like in minutes
   * @returns Time elapsed in minutes
   */
  public getMinutesSinceLike(): number {
    const now = new Date();
    const timeDifference = now.getTime() - this.likedAt.getTime();
    return Math.floor(timeDifference / (1000 * 60));
  }

  /**
   * Gets the time elapsed since the like in hours
   * @returns Time elapsed in hours
   */
  public getHoursSinceLike(): number {
    const now = new Date();
    const timeDifference = now.getTime() - this.likedAt.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60));
  }

  /**
   * Gets the time elapsed since the like in days
   * @returns Time elapsed in days
   */
  public getDaysSinceLike(): number {
    const now = new Date();
    const timeDifference = now.getTime() - this.likedAt.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }
}
