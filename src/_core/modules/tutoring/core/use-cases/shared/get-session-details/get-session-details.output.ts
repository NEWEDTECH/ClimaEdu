import { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Output for GetSessionDetailsUseCase
 */
export interface GetSessionDetailsOutput {
  session: TutoringSession;
  canEdit: boolean;
  canCancel: boolean;
  canStart: boolean;
  canComplete: boolean;
  isOverdue: boolean;
}
