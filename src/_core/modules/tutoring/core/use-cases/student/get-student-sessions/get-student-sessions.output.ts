import { TutoringSession } from '../../../entities/TutoringSession';

/**
 * Output for GetStudentSessionsUseCase
 */
export interface GetStudentSessionsOutput {
  sessions: TutoringSession[];
  upcomingSessions: TutoringSession[];
  pastSessions: TutoringSession[];
  totalCount: number;
  upcomingCount: number;
  pastCount: number;
}
