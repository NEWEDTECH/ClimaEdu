import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { ContentSymbols } from '@/_core/shared/container/modules/content/symbols';
import { DayOfWeek } from '../../../entities/TimeSlot';
import type { TimeSlotRepository } from '../../../../infrastructure/repositories/TimeSlotRepository';
import type { TutoringSessionRepository } from '../../../../infrastructure/repositories/TutoringSessionRepository';
import type { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository';
import { FindAvailableTimeSlotsInput } from './find-available-time-slots.input';
import { FindAvailableTimeSlotsOutput, AvailableTimeSlot } from './find-available-time-slots.output';

/**
 * Use case for finding available time slots for tutoring sessions
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for finding available tutors and time slots based on student requirements
 */
@injectable()
export class FindAvailableTimeSlotsUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TimeSlotRepository)
    private readonly timeSlotRepository: TimeSlotRepository,
    @inject(TutoringSymbols.repositories.TutoringSessionRepository)
    private readonly sessionRepository: TutoringSessionRepository,
    @inject(ContentSymbols.repositories.CourseTutorRepository)
    private readonly courseTutorRepository: CourseTutorRepository
  ) {}

  /**
   * Executes the use case to find available time slots
   * @param input The input parameters for finding available slots
   * @returns Promise<FindAvailableTimeSlotsOutput> The result containing available slots
   */
  async execute(input: FindAvailableTimeSlotsInput): Promise<FindAvailableTimeSlotsOutput> {
    // Validate input
    this.validateInput(input);

    // Get day of week from the requested date
    const dayOfWeek = input.date.getDay() as DayOfWeek;

    // Step 1: Find tutors associated with the course
    const courseTutors = await this.courseTutorRepository.findByCourseId(input.courseId);
    const tutorIds = courseTutors.map(ct => ct.userId);

    if (tutorIds.length === 0) {
      // No tutors associated with this course
      return {
        availableSlots: [],
        requestedDate: input.date,
        requestedDuration: input.duration,
        totalSlotsFound: 0
      };
    }

    // Step 2: Find available time slots for the day, filtered by course tutors
    let availableTimeSlots;
    if (input.tutorId) {
      // Check if the specific tutor is associated with the course
      if (!tutorIds.includes(input.tutorId)) {
        return {
          availableSlots: [],
          requestedDate: input.date,
          requestedDuration: input.duration,
          totalSlotsFound: 0
        };
      }
      // Find slots for specific tutor
      availableTimeSlots = await this.timeSlotRepository.findByTutorAndDay(
        input.tutorId,
        dayOfWeek,
        true // activeOnly
      );
    } else {
      // Find all active slots for the day, then filter by course tutors
      const allActiveSlots = await this.timeSlotRepository.findAllActive(dayOfWeek);
      availableTimeSlots = allActiveSlots.filter(slot => tutorIds.includes(slot.tutorId));
    }

    // Step 3: Filter slots that can accommodate the requested duration and check for conflicts
    const availableSlots: AvailableTimeSlot[] = [];

    for (const timeSlot of availableTimeSlots) {
      // Check if the slot can accommodate the requested duration
      if (timeSlot.getDurationInMinutes() >= input.duration) {
        // Generate possible start times within this slot
        const possibleStartTimes = this.generatePossibleStartTimes(
          timeSlot.startTime,
          timeSlot.endTime,
          input.duration
        );

        // Check each possible start time for conflicts
        const availableStartTimes: string[] = [];
        
        for (const startTime of possibleStartTimes) {
          const sessionStart = this.createDateTimeFromTimeString(input.date, startTime);
          
          // Check for conflicts with existing sessions
          const conflicts = await this.sessionRepository.findConflictingSessions(
            timeSlot.tutorId,
            sessionStart,
            input.duration
          );

          if (conflicts.length === 0) {
            availableStartTimes.push(startTime);
          }
        }

        // If there are available start times, add to results
        if (availableStartTimes.length > 0) {
          availableSlots.push({
            timeSlot,
            tutorId: timeSlot.tutorId,
            availableStartTimes
          });
        }
      }
    }

    return {
      availableSlots,
      requestedDate: input.date,
      requestedDuration: input.duration,
      totalSlotsFound: availableSlots.length
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: FindAvailableTimeSlotsInput): void {
    if (!input.courseId || input.courseId.trim() === '') {
      throw new Error('Course ID is required');
    }

    if (!input.date) {
      throw new Error('Date is required');
    }

    if (input.date < new Date()) {
      throw new Error('Date cannot be in the past');
    }

    if (!input.duration || input.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }

    if (input.duration < 30) {
      throw new Error('Minimum session duration is 30 minutes');
    }

    if (input.duration > 480) {
      throw new Error('Maximum session duration is 8 hours');
    }

    if (input.tutorId && input.tutorId.trim() === '') {
      throw new Error('Tutor ID cannot be empty if provided');
    }
  }

  /**
   * Generates possible start times within a time slot that can accommodate the duration
   */
  private generatePossibleStartTimes(
    slotStart: string,
    slotEnd: string,
    durationMinutes: number
  ): string[] {
    const startTimes: string[] = [];
    const slotStartMinutes = this.timeToMinutes(slotStart);
    const slotEndMinutes = this.timeToMinutes(slotEnd);
    
    // Generate start times in 15-minute intervals
    const intervalMinutes = 15;
    
    for (let currentMinutes = slotStartMinutes; 
         currentMinutes + durationMinutes <= slotEndMinutes; 
         currentMinutes += intervalMinutes) {
      
      const timeString = this.minutesToTime(currentMinutes);
      startTimes.push(timeString);
    }

    return startTimes;
  }

  /**
   * Creates a Date object from a date and time string
   */
  private createDateTimeFromTimeString(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  /**
   * Converts time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converts minutes since midnight to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
