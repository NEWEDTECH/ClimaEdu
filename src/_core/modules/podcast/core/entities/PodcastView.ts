/**
 * PodcastView entity representing a view event for a podcast by a user
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class PodcastView {
  private constructor(
    readonly id: string,
    readonly podcastId: string,
    readonly userId: string,
    readonly institutionId: string,
    readonly viewedAt: Date
  ) {}

  /**
   * Creates a new PodcastView instance
   * @param params PodcastView properties
   * @returns A new PodcastView instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    podcastId: string;
    userId: string;
    institutionId: string;
    viewedAt?: Date;
  }): PodcastView {
    if (!params.podcastId || params.podcastId.trim() === '') {
      throw new Error('Podcast ID cannot be empty');
    }

    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    return new PodcastView(
      params.id,
      params.podcastId,
      params.userId,
      params.institutionId,
      params.viewedAt ?? new Date()
    );
  }

  /**
   * Checks if this view is recent based on the provided threshold
   * @param hoursThreshold Number of hours to consider as recent
   * @returns True if the view is within the threshold, false otherwise
   */
  public isRecentView(hoursThreshold: number): boolean {
    if (hoursThreshold <= 0) {
      throw new Error('Hours threshold must be positive');
    }

    const now = new Date();
    const thresholdMs = hoursThreshold * 60 * 60 * 1000; // Convert hours to milliseconds
    const timeDifference = now.getTime() - this.viewedAt.getTime();

    return timeDifference <= thresholdMs;
  }

  /**
   * Gets the time elapsed since the view in minutes
   * @returns Time elapsed in minutes
   */
  public getMinutesSinceView(): number {
    const now = new Date();
    const timeDifference = now.getTime() - this.viewedAt.getTime();
    return Math.floor(timeDifference / (1000 * 60));
  }

  /**
   * Gets the time elapsed since the view in hours
   * @returns Time elapsed in hours
   */
  public getHoursSinceView(): number {
    const now = new Date();
    const timeDifference = now.getTime() - this.viewedAt.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60));
  }
}
