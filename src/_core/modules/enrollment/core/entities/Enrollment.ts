import { randomUUID } from 'crypto';
import { EnrollmentStatus } from './EnrollmentStatus';

/**
 * Enrollment entity representing a user's enrollment in a course
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Enrollment {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly courseId: string,
    readonly institutionId: string,
    public status: EnrollmentStatus,
    readonly enrolledAt: Date,
    public completedAt?: Date
  ) {}

  /**
   * Creates a new Enrollment instance
   * @param params Enrollment properties
   * @returns A new Enrollment instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id?: string; // Optional ID, will be generated if not provided
    userId: string;
    courseId: string;
    institutionId: string;
    status?: EnrollmentStatus;
    enrolledAt?: Date;
    completedAt?: Date;
  }): Enrollment {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.courseId || params.courseId.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    // Default status is ENROLLED if not provided
    const status = params.status ?? EnrollmentStatus.ENROLLED;
    
    // If status is COMPLETED, completedAt must be provided or set to now
    let completedAt = params.completedAt;
    if (status === EnrollmentStatus.COMPLETED && !completedAt) {
      completedAt = new Date();
    }

    // enrolledAt defaults to now if not provided
    const enrolledAt = params.enrolledAt ?? new Date();

    return new Enrollment(
      randomUUID(),
      params.userId,
      params.courseId,
      params.institutionId,
      status,
      enrolledAt,
      completedAt
    );
  }

  /**
   * Marks the enrollment as completed
   * @returns The updated enrollment
   * @throws Error if the enrollment is already completed or cancelled
   */
  public complete(): void {
    if (this.status === EnrollmentStatus.COMPLETED) {
      throw new Error('Enrollment is already completed');
    }

    if (this.status === EnrollmentStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled enrollment');
    }

    this.status = EnrollmentStatus.COMPLETED;
    this.completedAt = new Date();
  }

  /**
   * Cancels the enrollment
   * @returns The updated enrollment
   * @throws Error if the enrollment is already cancelled
   */
  public cancel(): void {
    if (this.status === EnrollmentStatus.CANCELLED) {
      throw new Error('Enrollment is already cancelled');
    }

    this.status = EnrollmentStatus.CANCELLED;
    this.completedAt = undefined;
  }

  /**
   * Reactivates a cancelled enrollment
   * @returns The updated enrollment
   * @throws Error if the enrollment is not cancelled
   */
  public reactivate(): void {
    if (this.status !== EnrollmentStatus.CANCELLED) {
      throw new Error('Only cancelled enrollments can be reactivated');
    }

    this.status = EnrollmentStatus.ENROLLED;
    this.completedAt = undefined;
  }
}
