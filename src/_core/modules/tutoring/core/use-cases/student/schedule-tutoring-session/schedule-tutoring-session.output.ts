import { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Output for ScheduleTutoringSessionUseCase
 */
export interface ScheduleTutoringSessionOutput {
  session: TutoringSession;
  success: boolean;
  message: string;
}
