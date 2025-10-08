import { ActivitySubmissionStatus } from './ActivitySubmissionStatus';

/**
 * ActivitySubmission entity representing a student's submission for an activity
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class ActivitySubmission {
  private constructor(
    readonly id: string,
    readonly activityId: string,
    readonly studentId: string,
    readonly institutionId: string,
    readonly fileUrls: string[],
    public status: ActivitySubmissionStatus,
    public feedback: string | null,
    public reviewedBy: string | null,
    readonly submittedAt: Date,
    public reviewedAt: Date | null
  ) {}

  /**
   * Creates a new ActivitySubmission instance
   * @param params ActivitySubmission properties
   * @returns A new ActivitySubmission instance
   */
  public static create(params: {
    id: string;
    activityId: string;
    studentId: string;
    institutionId: string;
    fileUrls: string[];
    status?: ActivitySubmissionStatus;
    feedback?: string | null;
    reviewedBy?: string | null;
    submittedAt?: Date;
    reviewedAt?: Date | null;
  }): ActivitySubmission {
    return new ActivitySubmission(
      params.id,
      params.activityId,
      params.studentId,
      params.institutionId,
      params.fileUrls,
      params.status ?? ActivitySubmissionStatus.PENDING,
      params.feedback ?? null,
      params.reviewedBy ?? null,
      params.submittedAt ?? new Date(),
      params.reviewedAt ?? null
    );
  }

  /**
   * Approves the submission
   * @param tutorId The ID of the tutor approving the submission
   * @param feedback Optional feedback for the student
   */
  public approve(tutorId: string, feedback?: string): void {
    if (this.status !== ActivitySubmissionStatus.PENDING) {
      throw new Error('Only pending submissions can be approved');
    }

    this.status = ActivitySubmissionStatus.APPROVED;
    this.reviewedBy = tutorId;
    this.feedback = feedback ?? null;
    this.reviewedAt = new Date();
  }

  /**
   * Rejects the submission
   * @param tutorId The ID of the tutor rejecting the submission
   * @param feedback Feedback explaining why the submission was rejected
   */
  public reject(tutorId: string, feedback: string): void {
    if (this.status !== ActivitySubmissionStatus.PENDING) {
      throw new Error('Only pending submissions can be rejected');
    }

    if (!feedback || feedback.trim() === '') {
      throw new Error('Feedback is required when rejecting a submission');
    }

    this.status = ActivitySubmissionStatus.REJECTED;
    this.reviewedBy = tutorId;
    this.feedback = feedback;
    this.reviewedAt = new Date();
  }

  /**
   * Checks if the submission is pending review
   * @returns True if pending, false otherwise
   */
  public isPending(): boolean {
    return this.status === ActivitySubmissionStatus.PENDING;
  }

  /**
   * Checks if the submission has been approved
   * @returns True if approved, false otherwise
   */
  public isApproved(): boolean {
    return this.status === ActivitySubmissionStatus.APPROVED;
  }

  /**
   * Checks if the submission has been rejected
   * @returns True if rejected, false otherwise
   */
  public isRejected(): boolean {
    return this.status === ActivitySubmissionStatus.REJECTED;
  }
}
