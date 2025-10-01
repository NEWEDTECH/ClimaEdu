import { TimeSlot } from '../../../entities/TimeSlot';

/**
 * Available time slot with tutor information
 */
export interface AvailableTimeSlot {
  timeSlot: TimeSlot;
  tutorId: string;
  availableStartTimes: string[]; // Array of start times that fit the requested duration
}

/**
 * Output for FindAvailableTimeSlotsUseCase
 */
export interface FindAvailableTimeSlotsOutput {
  availableSlots: AvailableTimeSlot[];
  requestedDate: Date;
  requestedDuration: number;
  totalSlotsFound: number;
}
