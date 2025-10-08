/**
 * Input data for approving or rejecting an activity submission
 */
export interface ApproveRejectActivitySubmissionInput {
  /**
   * The ID of the activity submission
   */
  submissionId: string;

  /**
   * The action to perform: 'approve' or 'reject'
   */
  action: 'approve' | 'reject';

  /**
   * The ID of the tutor performing the action
   */
  tutorId: string;

  /**
   * Optional feedback for the student
   * Required when rejecting
   */
  feedback?: string;
}
