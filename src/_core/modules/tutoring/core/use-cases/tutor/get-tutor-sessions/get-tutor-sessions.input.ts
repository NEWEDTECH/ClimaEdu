import { TutoringSessionStatus, SessionPriority } from '../../../entities/TutoringSession';

/**
 * Input for GetTutorSessionsUseCase
 */
export interface GetTutorSessionsInput {
  tutorId: string;
  status?: TutoringSessionStatus;
  priority?: SessionPriority;
  dateFilter?: 'today' | 'upcoming' | 'past' | 'all';
  limit?: number;
  includeStats?: boolean;
}
