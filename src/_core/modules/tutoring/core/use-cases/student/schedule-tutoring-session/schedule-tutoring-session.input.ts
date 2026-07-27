import { SessionPriority } from '../../../entities/TutoringSession';

/**
 * Input for ScheduleTutoringSessionUseCase
 */
export interface ScheduleTutoringSessionInput {
  studentId: string;
  courseId: string;
  scheduledDate: Date;
  duration: number; // in minutes
  studentQuestion: string;
  priority?: SessionPriority;
  /** Tutor chosen by the student; falls back to the first tutor of the course */
  tutorId?: string;
}
