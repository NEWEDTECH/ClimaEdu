import { TutoringSession } from '../../../entities/TutoringSession';
import type { SessionStats } from '../../../../infrastructure/repositories/TutoringSessionRepository';

/**
 * Output for GetTutorSessionsUseCase
 */
export interface GetTutorSessionsOutput {
  sessions: TutoringSession[];
  groupedSessions: {
    requested: TutoringSession[];
    scheduled: TutoringSession[];
    inProgress: TutoringSession[];
    completed: TutoringSession[];
    cancelled: TutoringSession[];
  };
  totalCount: number;
  stats?: SessionStats;
}
