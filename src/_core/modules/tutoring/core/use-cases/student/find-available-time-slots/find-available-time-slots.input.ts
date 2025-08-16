/**
 * Input for FindAvailableTimeSlotsUseCase
 */
export interface FindAvailableTimeSlotsInput {
  courseId: string;
  date: Date;
  duration: number; // Duration in minutes
  tutorId?: string; // Optional: specific tutor, otherwise find any available tutor
}
