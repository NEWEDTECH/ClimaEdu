import { ActivitySubmission } from '../../entities/ActivitySubmission';

/**
 * Output data for approving or rejecting an activity submission
 */
export interface ApproveRejectActivitySubmissionOutput {
  /**
   * The updated activity submission
   */
  submission: ActivitySubmission;

  /**
   * Message describing the result
   */
  message: string;
}
