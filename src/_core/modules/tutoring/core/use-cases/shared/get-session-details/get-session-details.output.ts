import { TutoringSession } from '../../../entities/TutoringSession';
import { Subject } from '../../../entities/Subject';

/**
 * Output for GetSessionDetailsUseCase
 */
export interface GetSessionDetailsOutput {
  session: TutoringSession;
  subject: Subject;
  canEdit: boolean;
  canCancel: boolean;
  canStart: boolean;
  canComplete: boolean;
  isOverdue: boolean;
}
