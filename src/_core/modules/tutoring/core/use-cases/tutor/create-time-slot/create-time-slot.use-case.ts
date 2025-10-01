import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import { TimeSlot } from '../../../entities/TimeSlot';
import type { TimeSlotRepository } from '../../../../infrastructure/repositories/TimeSlotRepository';
import { CreateTimeSlotInput } from './create-time-slot.input';
import { CreateTimeSlotOutput } from './create-time-slot.output';

/**
 * Use case for creating a new time slot for tutor availability
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for creating time slots with proper validation and conflict checking
 */
@injectable()
export class CreateTimeSlotUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.TimeSlotRepository)
    private readonly timeSlotRepository: TimeSlotRepository
  ) {}

  /**
   * Executes the use case to create a new time slot
   * @param input The input parameters for creating the time slot
   * @returns Promise<CreateTimeSlotOutput> The result of the operation
   */
  async execute(input: CreateTimeSlotInput): Promise<CreateTimeSlotOutput> {
    // Validate input
    this.validateInput(input);

    // Check for overlapping time slots
    await this.validateNoOverlaps(input);

    // Generate unique ID
    const id = await this.timeSlotRepository.generateId();

    // Create the time slot entity
    const timeSlot = TimeSlot.create({
      id,
      tutorId: input.tutorId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      recurrenceEndDate: input.recurrenceEndDate
    });

    // Save to repository
    const savedTimeSlot = await this.timeSlotRepository.save(timeSlot);

    return {
      timeSlot: savedTimeSlot,
      success: true,
      message: 'Time slot created successfully'
    };
  }

  /**
   * Validates the input parameters
   */
  private validateInput(input: CreateTimeSlotInput): void {
    if (!input.tutorId || input.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }

    if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    if (!input.startTime || !input.endTime) {
      throw new Error('Start time and end time are required');
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(input.startTime)) {
      throw new Error('Start time must be in HH:MM format (24-hour)');
    }

    if (!timeRegex.test(input.endTime)) {
      throw new Error('End time must be in HH:MM format (24-hour)');
    }

    // Validate time range
    const startMinutes = this.timeToMinutes(input.startTime);
    const endMinutes = this.timeToMinutes(input.endTime);

    if (startMinutes >= endMinutes) {
      throw new Error('Start time must be before end time');
    }

    // Minimum duration of 30 minutes
    if (endMinutes - startMinutes < 30) {
      throw new Error('Time slot must be at least 30 minutes long');
    }

    // Maximum duration of 8 hours
    if (endMinutes - startMinutes > 480) {
      throw new Error('Time slot cannot exceed 8 hours');
    }

    if (input.recurrenceEndDate && input.recurrenceEndDate <= new Date()) {
      throw new Error('Recurrence end date must be in the future');
    }
  }

  /**
   * Validates that the new time slot doesn't overlap with existing ones
   */
  private async validateNoOverlaps(input: CreateTimeSlotInput): Promise<void> {
    const overlappingSlots = await this.timeSlotRepository.findOverlapping(
      input.tutorId,
      input.dayOfWeek,
      input.startTime,
      input.endTime
    );

    if (overlappingSlots.length > 0) {
      const existingSlot = overlappingSlots[0];
      throw new Error(
        `Time slot overlaps with existing availability: ${existingSlot.getDayName()} ${existingSlot.startTime}-${existingSlot.endTime}`
      );
    }
  }

  /**
   * Converts time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
