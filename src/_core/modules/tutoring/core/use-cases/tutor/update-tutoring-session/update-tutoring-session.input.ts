import type { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Input for UpdateTutoringSessionUseCase
 */
export interface UpdateTutoringSessionInput {
  sessionId: string;
  tutorId: string;
  updatedSession: TutoringSession;
}
