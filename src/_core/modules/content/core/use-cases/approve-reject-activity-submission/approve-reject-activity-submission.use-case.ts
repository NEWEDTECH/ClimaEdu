import { inject, injectable } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { ActivitySubmissionRepository } from '../../../infrastructure/repositories/ActivitySubmissionRepository';
import type { ApproveRejectActivitySubmissionInput } from './approve-reject-activity-submission.input';
import type { ApproveRejectActivitySubmissionOutput } from './approve-reject-activity-submission.output';

/**
 * Use case for approving or rejecting an activity submission
 * Following Clean Architecture principles, this use case is pure and has no dependencies on infrastructure details
 */
@injectable()
export class ApproveRejectActivitySubmissionUseCase {
  constructor(
    @inject(Register.content.repository.ActivitySubmissionRepository)
    private readonly activitySubmissionRepository: ActivitySubmissionRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data containing submission ID, action, tutor ID, and optional feedback
   * @returns Output data containing the updated submission and a message
   * @throws Error if submission not found, action is invalid, or validation fails
   */
  async execute(
    input: ApproveRejectActivitySubmissionInput
  ): Promise<ApproveRejectActivitySubmissionOutput> {
    // Validate input
    if (!input.submissionId || input.submissionId.trim() === '') {
      throw new Error('Submission ID is required');
    }

    if (!input.tutorId || input.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }

    if (input.action !== 'approve' && input.action !== 'reject') {
      throw new Error('Action must be either "approve" or "reject"');
    }

    // Find the submission
    const submission = await this.activitySubmissionRepository.findById(
      input.submissionId
    );

    if (!submission) {
      throw new Error('Activity submission not found');
    }

    // Perform the action
    if (input.action === 'approve') {
      submission.approve(input.tutorId, input.feedback);
    } else {
      if (!input.feedback || input.feedback.trim() === '') {
        throw new Error('Feedback is required when rejecting a submission');
      }
      submission.reject(input.tutorId, input.feedback);
    }

    // Save the updated submission
    const updatedSubmission = await this.activitySubmissionRepository.save(
      submission
    );

    // Return the result
    return {
      submission: updatedSubmission,
      message:
        input.action === 'approve'
          ? 'Activity submission approved successfully'
          : 'Activity submission rejected successfully',
    };
  }
}
