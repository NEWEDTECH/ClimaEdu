import { TutoringSessionStatus } from '../../../entities/TutoringSession';

/**
 * Input for UpdateSessionStatusUseCase
 */
export interface UpdateSessionStatusInput {
  sessionId: string;
  tutorId: string;
  newStatus: TutoringSessionStatus;
  sessionSummary?: string;
  materials?: string[];
  cancelReason?: string;
}
