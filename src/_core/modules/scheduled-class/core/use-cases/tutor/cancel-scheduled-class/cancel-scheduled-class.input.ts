/**
 * Input for CancelScheduledClassUseCase
 */
export interface CancelScheduledClassInput {
  scheduledClassId: string;
  tutorId: string;
  reason?: string;
}
