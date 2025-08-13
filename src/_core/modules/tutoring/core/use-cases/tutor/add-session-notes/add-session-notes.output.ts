import { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Output for AddSessionNotesUseCase
 */
export interface AddSessionNotesOutput {
  session: TutoringSession;
  success: boolean;
  message: string;
}
