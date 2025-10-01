/**
 * Input for CancelTutoringSessionUseCase
 */
export interface CancelTutoringSessionInput {
  sessionId: string;
  studentId: string;
  cancelReason: string;
}
