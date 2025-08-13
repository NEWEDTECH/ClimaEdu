import { TutoringSessionStatus } from '../../../entities/TutoringSession';

/**
 * Input for GetStudentSessionsUseCase
 */
export interface GetStudentSessionsInput {
  studentId: string;
  status?: TutoringSessionStatus;
  limit?: number;
  includeUpcoming?: boolean;
  includePast?: boolean;
}
