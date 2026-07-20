/**
 * Input for ScheduleClassUseCase
 */
export interface ScheduleClassInput {
  tutorId: string;
  classId: string;
  scheduledDate: Date;
  meetingUrl: string;
  title?: string;
}
