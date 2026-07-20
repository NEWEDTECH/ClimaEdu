/**
 * Input for UpdateScheduledClassUseCase
 */
export interface UpdateScheduledClassInput {
  scheduledClassId: string;
  tutorId: string;
  scheduledDate?: Date;
  meetingUrl?: string;
  title?: string;
}
