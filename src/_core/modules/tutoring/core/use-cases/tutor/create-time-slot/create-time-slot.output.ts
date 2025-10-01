import { TimeSlot } from '../../../entities/TimeSlot';

/**
 * Output for CreateTimeSlotUseCase
 */
export interface CreateTimeSlotOutput {
  timeSlot: TimeSlot;
  success: boolean;
  message: string;
}
