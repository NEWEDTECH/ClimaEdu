/**
 * CourseTutor entity representing an association between a tutor and a course
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class CourseTutor {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly courseId: string,
    readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new CourseTutor instance
   * @param params CourseTutor properties
   * @returns A new CourseTutor instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    userId: string;
    courseId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): CourseTutor {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    const now = new Date();
    
    return new CourseTutor(
      params.id,
      params.userId,
      params.courseId,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
}
