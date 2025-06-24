import { ContentProgress } from './ContentProgress';
import { LessonProgressStatus, ContentProgressStatus } from './ProgressStatus';
import { nanoid } from 'nanoid';

/**
 * LessonProgress entity representing a student's progress in a lesson
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 * This is an aggregate root that contains ContentProgress value objects
 */
export class LessonProgress {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly lessonId: string,
    readonly institutionId: string,
    public status: LessonProgressStatus,
    readonly startedAt: Date,
    public completedAt: Date | null,
    public lastAccessedAt: Date,
    public contentProgresses: ContentProgress[],
    public updatedAt: Date
  ) {}

  /**
   * Creates a new LessonProgress instance
   * @param params LessonProgress properties
   * @returns A new LessonProgress instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id?: string;
    userId: string;
    lessonId: string;
    institutionId: string;
    contentIds: string[];
    status?: LessonProgressStatus;
    startedAt?: Date;
    completedAt?: Date | null;
    lastAccessedAt?: Date;
    contentProgresses?: ContentProgress[];
    updatedAt?: Date;
  }): LessonProgress {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.lessonId || params.lessonId.trim() === '') {
      throw new Error('Lesson ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (!params.contentIds || params.contentIds.length === 0) {
      throw new Error('Content IDs cannot be empty');
    }

    const now = new Date();
    const id = params.id || `lp_${nanoid(10)}`;
    
    // Initialize content progresses if not provided
    const contentProgresses = params.contentProgresses || params.contentIds.map(contentId =>
      ContentProgress.create({ contentId })
    );

    return new LessonProgress(
      id,
      params.userId,
      params.lessonId,
      params.institutionId,
      params.status ?? LessonProgressStatus.IN_PROGRESS,
      params.startedAt ?? now,
      params.completedAt ?? null,
      params.lastAccessedAt ?? now,
      contentProgresses,
      params.updatedAt ?? now
    );
  }

  /**
   * Updates the progress of a specific content within this lesson
   * @param contentId The ID of the content to update
   * @param progressPercentage New progress percentage (0-100)
   * @param timeSpent Additional time spent (in seconds)
   * @param lastPosition Last position for video/audio content
   * @throws Error if content is not found
   */
  public updateContentProgress(
    contentId: string,
    progressPercentage: number,
    timeSpent?: number,
    lastPosition?: number
  ): void {
    const contentProgress = this.getContentProgress(contentId);
    if (!contentProgress) {
      throw new Error(`Content with ID ${contentId} not found in this lesson progress`);
    }

    contentProgress.updateProgress(progressPercentage, timeSpent, lastPosition);
    this.lastAccessedAt = new Date();
    this.updatedAt = new Date();

    // Check if lesson should be marked as completed
    this.checkAndUpdateLessonCompletion();
  }

  /**
   * Marks a specific content as completed
   * @param contentId The ID of the content to mark as completed
   * @throws Error if content is not found
   */
  public markContentAsCompleted(contentId: string): void {
    const contentProgress = this.getContentProgress(contentId);
    if (!contentProgress) {
      throw new Error(`Content with ID ${contentId} not found in this lesson progress`);
    }

    contentProgress.markAsCompleted();
    this.lastAccessedAt = new Date();
    this.updatedAt = new Date();

    // Check if lesson should be marked as completed
    this.checkAndUpdateLessonCompletion();
  }

  /**
   * Checks if all contents are completed and updates lesson status accordingly
   */
  public checkAndUpdateLessonCompletion(): void {
    const allCompleted = this.contentProgresses.every(cp => cp.isCompleted());
    
    if (allCompleted && this.status !== LessonProgressStatus.COMPLETED) {
      this.status = LessonProgressStatus.COMPLETED;
      this.completedAt = new Date();
      this.updatedAt = new Date();
    } else if (!allCompleted && this.status === LessonProgressStatus.COMPLETED) {
      // If lesson was completed but now some content is not completed, revert status
      this.status = LessonProgressStatus.IN_PROGRESS;
      this.completedAt = null;
      this.updatedAt = new Date();
    }
  }

  /**
   * Forces the completion of the entire lesson (marks all contents as completed)
   */
  public forceComplete(): void {
    this.contentProgresses.forEach(cp => cp.markAsCompleted());
    this.status = LessonProgressStatus.COMPLETED;
    this.completedAt = new Date();
    this.lastAccessedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Calculates the overall progress percentage of the lesson
   * @returns Progress percentage (0-100)
   */
  public calculateOverallProgress(): number {
    if (this.contentProgresses.length === 0) {
      return 0;
    }

    const totalProgress = this.contentProgresses.reduce(
      (sum, cp) => sum + cp.progressPercentage,
      0
    );

    return Math.round((totalProgress / this.contentProgresses.length) * 100) / 100;
  }

  /**
   * Gets the total time spent on this lesson across all contents
   * @returns Total time spent in seconds
   */
  public getTotalTimeSpent(): number {
    return this.contentProgresses.reduce((sum, cp) => sum + cp.timeSpent, 0);
  }

  /**
   * Gets the total time spent in minutes
   * @returns Total time spent in minutes (rounded to 2 decimal places)
   */
  public getTotalTimeSpentInMinutes(): number {
    return Math.round((this.getTotalTimeSpent() / 60) * 100) / 100;
  }

  /**
   * Gets the total time spent in hours
   * @returns Total time spent in hours (rounded to 2 decimal places)
   */
  public getTotalTimeSpentInHours(): number {
    return Math.round((this.getTotalTimeSpent() / 3600) * 100) / 100;
  }

  /**
   * Gets the progress of a specific content
   * @param contentId The ID of the content
   * @returns ContentProgress or null if not found
   */
  public getContentProgress(contentId: string): ContentProgress | null {
    return this.contentProgresses.find(cp => cp.contentId === contentId) || null;
  }

  /**
   * Gets all content IDs in this lesson
   * @returns Array of content IDs
   */
  public getAllContentIds(): string[] {
    return this.contentProgresses.map(cp => cp.contentId);
  }

  /**
   * Gets IDs of completed contents
   * @returns Array of completed content IDs
   */
  public getCompletedContentIds(): string[] {
    return this.contentProgresses
      .filter(cp => cp.isCompleted())
      .map(cp => cp.contentId);
  }

  /**
   * Gets IDs of in-progress contents
   * @returns Array of in-progress content IDs
   */
  public getInProgressContentIds(): string[] {
    return this.contentProgresses
      .filter(cp => cp.status === ContentProgressStatus.IN_PROGRESS)
      .map(cp => cp.contentId);
  }

  /**
   * Gets IDs of not started contents
   * @returns Array of not started content IDs
   */
  public getNotStartedContentIds(): string[] {
    return this.contentProgresses
      .filter(cp => cp.status === ContentProgressStatus.NOT_STARTED)
      .map(cp => cp.contentId);
  }

  /**
   * Checks if the lesson is completed
   * @returns true if the lesson is completed
   */
  public isCompleted(): boolean {
    return this.status === LessonProgressStatus.COMPLETED;
  }

  /**
   * Checks if the lesson has been started
   * @returns true if the lesson has been started
   */
  public hasStarted(): boolean {
    return this.status !== LessonProgressStatus.NOT_STARTED;
  }

  /**
   * Gets the number of completed contents
   * @returns Number of completed contents
   */
  public getCompletedContentCount(): number {
    return this.contentProgresses.filter(cp => cp.isCompleted()).length;
  }

  /**
   * Gets the total number of contents
   * @returns Total number of contents
   */
  public getTotalContentCount(): number {
    return this.contentProgresses.length;
  }

  /**
   * Updates the last accessed timestamp
   */
  public touch(): void {
    this.lastAccessedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Adds a new content progress to this lesson
   * @param contentId The ID of the new content
   */
  public addContentProgress(contentId: string): void {
    // Check if content already exists
    if (this.getContentProgress(contentId)) {
      throw new Error(`Content with ID ${contentId} already exists in this lesson progress`);
    }

    const newContentProgress = ContentProgress.create({ contentId });
    this.contentProgresses.push(newContentProgress);
    this.updatedAt = new Date();

    // Recheck lesson completion status
    this.checkAndUpdateLessonCompletion();
  }

  /**
   * Removes a content progress from this lesson
   * @param contentId The ID of the content to remove
   */
  public removeContentProgress(contentId: string): void {
    const index = this.contentProgresses.findIndex(cp => cp.contentId === contentId);
    if (index === -1) {
      throw new Error(`Content with ID ${contentId} not found in this lesson progress`);
    }

    this.contentProgresses.splice(index, 1);
    this.updatedAt = new Date();

    // Recheck lesson completion status
    this.checkAndUpdateLessonCompletion();
  }
}
