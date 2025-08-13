import { SessionPriority } from '../../../entities/TutoringSession';

/**
 * Input for ScheduleTutoringSessionUseCase
 */
export interface ScheduleTutoringSessionInput {
  studentId: string;
  tutorId: string;
  subjectId: string;
  courseId: string;
  scheduledDate: Date;
  duration: number; // in minutes
  studentQuestion: string;
  priority?: SessionPriority;
}
