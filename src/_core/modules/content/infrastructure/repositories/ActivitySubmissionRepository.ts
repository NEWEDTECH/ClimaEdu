import { ActivitySubmission } from '../../core/entities/ActivitySubmission';
import { ActivitySubmissionStatus } from '../../core/entities/ActivitySubmissionStatus';

/**
 * Interface for the ActivitySubmission repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ActivitySubmissionRepository {
  /**
   * Generate a new unique ID for an activity submission
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find an activity submission by ID
   * @param id Activity submission ID
   * @returns ActivitySubmission or null if not found
   */
  findById(id: string): Promise<ActivitySubmission | null>;

  /**
   * Find activity submissions by activity ID and student ID
   * @param activityId Activity ID
   * @param studentId Student ID
   * @returns Array of activity submissions
   */
  findByActivityAndStudent(
    activityId: string,
    studentId: string
  ): Promise<ActivitySubmission[]>;

  /**
   * Find activity submissions by activity ID
   * @param activityId Activity ID
   * @returns Array of activity submissions
   */
  findByActivityId(activityId: string): Promise<ActivitySubmission[]>;

  /**
   * Find activity submissions by student ID
   * @param studentId Student ID
   * @param institutionId Institution ID
   * @returns Array of activity submissions
   */
  findByStudentId(
    studentId: string,
    institutionId: string
  ): Promise<ActivitySubmission[]>;

  /**
   * Find activity submissions by status
   * @param status Submission status
   * @param institutionId Institution ID
   * @returns Array of activity submissions
   */
  findByStatus(
    status: ActivitySubmissionStatus,
    institutionId: string
  ): Promise<ActivitySubmission[]>;

  /**
   * Save an activity submission
   * @param submission Activity submission to save
   * @returns Saved activity submission
   */
  save(submission: ActivitySubmission): Promise<ActivitySubmission>;

  /**
   * Delete an activity submission
   * @param id Activity submission ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
