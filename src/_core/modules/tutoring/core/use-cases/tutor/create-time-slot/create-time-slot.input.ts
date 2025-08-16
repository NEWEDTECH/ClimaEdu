import { DayOfWeek } from '../../../entities/TimeSlot';

/**
 * Input for CreateTimeSlotUseCase
 */
export interface CreateTimeSlotInput {
  tutorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  recurrenceEndDate?: Date;
}
