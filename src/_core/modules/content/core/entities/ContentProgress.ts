import { ContentProgressStatus } from './ProgressStatus';
import { ContentType } from './ContentType';

/**
 * ContentProgress value object representing the progress of a specific content within a lesson
 * Following Clean Architecture principles, this is a value object with no dependencies on infrastructure
 */
export class ContentProgress {
  private constructor(
    readonly contentId: string,
    public status: ContentProgressStatus,
    public progressPercentage: number,
    public timeSpent: number,
    readonly startedAt: Date,
    public completedAt: Date | null,
    public lastPosition: number | null,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new ContentProgress instance
   * @param params ContentProgress properties
   * @returns A new ContentProgress instance
   * @throws Error if validation fails
   */
  public static create(params: {
    contentId: string;
    status?: ContentProgressStatus;
    progressPercentage?: number;
    timeSpent?: number;
    startedAt?: Date;
    completedAt?: Date | null;
    lastPosition?: number | null;
    updatedAt?: Date;
  }): ContentProgress {
    if (!params.contentId || params.contentId.trim() === '') {
      throw new Error('Content ID cannot be empty');
    }

    const progressPercentage = params.progressPercentage ?? 0;
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    const timeSpent = params.timeSpent ?? 0;
    if (timeSpent < 0) {
      throw new Error('Time spent cannot be negative');
    }

    const now = new Date();
    const status = params.status ?? ContentProgressStatus.NOT_STARTED;
    
    return new ContentProgress(
      params.contentId,
      status,
      progressPercentage,
      timeSpent,
      params.startedAt ?? now,
      params.completedAt ?? null,
      params.lastPosition ?? null,
      params.updatedAt ?? now
    );
  }

  /**
   * Updates the progress of this content
   * @param progressPercentage New progress percentage (0-100)
   * @param timeSpent Additional time spent (in seconds)
   * @param lastPosition Last position for video/audio content
   */
  public updateProgress(
    progressPercentage: number,
    timeSpent?: number,
    lastPosition?: number
  ): void {
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    this.progressPercentage = progressPercentage;
    
    if (timeSpent !== undefined) {
      if (timeSpent < 0) {
        throw new Error('Time spent cannot be negative');
      }
      this.timeSpent += timeSpent;
    }

    if (lastPosition !== undefined) {
      this.lastPosition = lastPosition;
    }

    // Update status based on progress
    if (progressPercentage >= 100) {
      this.status = ContentProgressStatus.COMPLETED;
      this.completedAt = new Date();
    } else if (progressPercentage > 0) {
      this.status = ContentProgressStatus.IN_PROGRESS;
    }

    this.updatedAt = new Date();
  }

  /**
   * Marks this content as completed
   */
  public markAsCompleted(): void {
    this.status = ContentProgressStatus.COMPLETED;
    this.progressPercentage = 100;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Completes content based on its type
   * Videos/Audio: Maintain current progress percentage
   * Other types (PDF, SCORM, etc.): Set to 100%
   */
  public completeBasedOnType(contentType: ContentType): void {
    this.status = ContentProgressStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();

    // For videos and audio, maintain current progress percentage
    // For other content types, set to 100%
    switch (contentType) {
      case ContentType.VIDEO:
      case ContentType.AUDIO:
      case ContentType.PODCAST:
        // Keep current progressPercentage - don't override it for media content
        break;
      case ContentType.PDF:
      case ContentType.SCORM:
      default:
        // Set to 100% for non-media content
        this.progressPercentage = 100;
        break;
    }
  }

  /**
   * Checks if this content is completed
   * @returns true if the content is completed
   */
  public isCompleted(): boolean {
    return this.status === ContentProgressStatus.COMPLETED;
  }

  /**
   * Checks if this content has been started
   * @returns true if the content has been started
   */
  public hasStarted(): boolean {
    return this.status !== ContentProgressStatus.NOT_STARTED;
  }

  /**
   * Gets the time spent in minutes
   * @returns Time spent in minutes (rounded to 2 decimal places)
   */
  public getTimeSpentInMinutes(): number {
    return Math.round((this.timeSpent / 60) * 100) / 100;
  }

  /**
   * Gets the time spent in hours
   * @returns Time spent in hours (rounded to 2 decimal places)
   */
  public getTimeSpentInHours(): number {
    return Math.round((this.timeSpent / 3600) * 100) / 100;
  }

  /**
   * Creates a copy of this ContentProgress with updated values
   * @param updates Partial updates to apply
   * @returns A new ContentProgress instance
   */
  public update(updates: Partial<{
    status: ContentProgressStatus;
    progressPercentage: number;
    timeSpent: number;
    completedAt: Date | null;
    lastPosition: number | null;
  }>): ContentProgress {
    return new ContentProgress(
      this.contentId,
      updates.status ?? this.status,
      updates.progressPercentage ?? this.progressPercentage,
      updates.timeSpent ?? this.timeSpent,
      this.startedAt,
      updates.completedAt !== undefined ? updates.completedAt : this.completedAt,
      updates.lastPosition !== undefined ? updates.lastPosition : this.lastPosition,
      new Date()
    );
  }
}
