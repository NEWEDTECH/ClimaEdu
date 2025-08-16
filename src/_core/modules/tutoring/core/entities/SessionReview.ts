/**
 * SessionReview entity representing a review/rating given by a student for a tutoring session
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class SessionReview {
  private constructor(
    readonly id: string,
    readonly sessionId: string,
    readonly studentId: string,
    readonly tutorId: string,
    public rating: number, // 1-5 scale
    public comment: string,
    readonly createdAt: Date,
    public updatedAt: Date,
    public isAnonymous: boolean = false
  ) {}

  /**
   * Creates a new SessionReview instance
   * @param params SessionReview properties
   * @returns A new SessionReview instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    sessionId: string;
    studentId: string;
    tutorId: string;
    rating: number;
    comment: string;
    isAnonymous?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): SessionReview {
    this.validateCreateParams(params);
    
    const now = new Date();
    
    return new SessionReview(
      params.id,
      params.sessionId,
      params.studentId,
      params.tutorId,
      params.rating,
      params.comment.trim(),
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.isAnonymous ?? false
    );
  }

  /**
   * Updates the rating
   * @param newRating New rating (1-5)
   */
  public updateRating(newRating: number): void {
    this.validateRating(newRating);
    
    this.rating = newRating;
    this.touch();
  }

  /**
   * Updates the comment
   * @param newComment New comment text
   */
  public updateComment(newComment: string): void {
    if (!newComment || newComment.trim() === '') {
      throw new Error('Review comment cannot be empty');
    }
    
    if (newComment.length > 1000) {
      throw new Error('Review comment cannot exceed 1000 characters');
    }
    
    this.comment = newComment.trim();
    this.touch();
  }

  /**
   * Sets the review as anonymous
   */
  public makeAnonymous(): void {
    this.isAnonymous = true;
    this.touch();
  }

  /**
   * Sets the review as non-anonymous
   */
  public makePublic(): void {
    this.isAnonymous = false;
    this.touch();
  }

  /**
   * Checks if the review is positive (rating >= 4)
   */
  public isPositive(): boolean {
    return this.rating >= 4;
  }

  /**
   * Checks if the review is negative (rating <= 2)
   */
  public isNegative(): boolean {
    return this.rating <= 2;
  }

  /**
   * Checks if the review is neutral (rating = 3)
   */
  public isNeutral(): boolean {
    return this.rating === 3;
  }

  /**
   * Gets the rating as a percentage (for display purposes)
   */
  public getRatingAsPercentage(): number {
    return (this.rating / 5) * 100;
  }

  /**
   * Gets the rating with stars representation
   */
  public getRatingAsStars(): string {
    const fullStars = '★'.repeat(this.rating);
    const emptyStars = '☆'.repeat(5 - this.rating);
    return fullStars + emptyStars;
  }

  /**
   * Gets a truncated version of the comment for previews
   * @param maxLength Maximum length of the truncated comment
   */
  public getTruncatedComment(maxLength: number = 100): string {
    if (this.comment.length <= maxLength) {
      return this.comment;
    }
    
    return this.comment.substring(0, maxLength).trim() + '...';
  }

  /**
   * Checks if the review was created recently (within last 24 hours)
   */
  public isRecent(): boolean {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.createdAt > oneDayAgo;
  }

  /**
   * Checks if the review has been edited (updatedAt > createdAt)
   */
  public hasBeenEdited(): boolean {
    return this.updatedAt.getTime() > this.createdAt.getTime();
  }

  /**
   * Updates the timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validates rating value
   */
  private validateRating(rating: number): void {
    if (!Number.isInteger(rating)) {
      throw new Error('Rating must be an integer');
    }
    
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }

  /**
   * Validates the parameters for creating a new review
   */
  private static validateCreateParams(params: {
    id: string;
    sessionId: string;
    studentId: string;
    tutorId: string;
    rating: number;
    comment: string;
    isAnonymous?: boolean;
  }): void {
    if (!params.id || params.id.trim() === '') {
      throw new Error('Review ID is required');
    }
    
    if (!params.sessionId || params.sessionId.trim() === '') {
      throw new Error('Session ID is required');
    }
    
    if (!params.studentId || params.studentId.trim() === '') {
      throw new Error('Student ID is required');
    }
    
    if (!params.tutorId || params.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }
    
    if (!Number.isInteger(params.rating)) {
      throw new Error('Rating must be an integer');
    }
    
    if (params.rating < 1 || params.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (!params.comment || params.comment.trim() === '') {
      throw new Error('Review comment is required');
    }
    
    if (params.comment.length > 1000) {
      throw new Error('Review comment cannot exceed 1000 characters');
    }
  }
}
