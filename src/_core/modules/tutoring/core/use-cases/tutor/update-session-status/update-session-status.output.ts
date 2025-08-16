import { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Output for UpdateSessionStatusUseCase
 */
export interface UpdateSessionStatusOutput {
  session: TutoringSession;
  success: boolean;
  message: string;
}
