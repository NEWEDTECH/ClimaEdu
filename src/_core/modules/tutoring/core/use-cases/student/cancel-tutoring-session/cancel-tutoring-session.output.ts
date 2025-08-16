import { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Output for CancelTutoringSessionUseCase
 */
export interface CancelTutoringSessionOutput {
  session: TutoringSession;
  success: boolean;
  message: string;
}
