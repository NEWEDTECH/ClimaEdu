import { TimeSlot, DayOfWeek } from '../../core/entities/TimeSlot';

/**
 * Repository interface for TimeSlot entity
 * Following Clean Architecture principles, this interface defines the contract
 * for persistence operations without depending on specific implementations
 */
export interface TimeSlotRepository {
  /**
   * Generates a unique ID for a new time slot
   * @returns Promise<string> A unique ID with 'tsl_' prefix
   */
  generateId(): Promise<string>;

  /**
   * Saves a time slot to the repository
   * @param timeSlot The time slot to save
   * @returns Promise<TimeSlot> The saved time slot
   */
  save(timeSlot: TimeSlot): Promise<TimeSlot>;

  /**
   * Finds a time slot by its ID
   * @param id The time slot ID
   * @returns Promise<TimeSlot | null> The time slot if found, null otherwise
   */
  findById(id: string): Promise<TimeSlot | null>;

  /**
   * Finds all time slots for a specific tutor
   * @param tutorId The tutor's ID
   * @param activeOnly Whether to include only available time slots
   * @returns Promise<TimeSlot[]> Array of time slots
   */
  findByTutorId(tutorId: string, activeOnly?: boolean): Promise<TimeSlot[]>;

  /**
   * Finds time slots for a specific tutor and day of week
   * @param tutorId The tutor's ID
   * @param dayOfWeek The day of the week
   * @param activeOnly Whether to include only available time slots
   * @returns Promise<TimeSlot[]> Array of time slots
   */
  findByTutorAndDay(
    tutorId: string,
    dayOfWeek: DayOfWeek,
    activeOnly?: boolean
  ): Promise<TimeSlot[]>;

  /**
   * Finds available time slots for a specific tutor within a time range
   * @param tutorId The tutor's ID
   * @param dayOfWeek The day of the week
   * @param startTime Start time in HH:MM format
   * @param endTime End time in HH:MM format
   * @returns Promise<TimeSlot[]> Array of available time slots
   */
  findAvailableInTimeRange(
    tutorId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string
  ): Promise<TimeSlot[]>;

  /**
   * Finds overlapping time slots for a tutor
   * @param tutorId The tutor's ID
   * @param dayOfWeek The day of the week
   * @param startTime Start time in HH:MM format
   * @param endTime End time in HH:MM format
   * @param excludeId Optional ID to exclude from the search
   * @returns Promise<TimeSlot[]> Array of overlapping time slots
   */
  findOverlapping(
    tutorId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<TimeSlot[]>;

  /**
   * Finds all active time slots across all tutors
   * @param dayOfWeek Optional day filter
   * @returns Promise<TimeSlot[]> Array of active time slots
   */
  findAllActive(dayOfWeek?: DayOfWeek): Promise<TimeSlot[]>;

  /**
   * Finds expired time slots (past recurrence end date)
   * @param tutorId Optional tutor filter
   * @returns Promise<TimeSlot[]> Array of expired time slots
   */
  findExpired(tutorId?: string): Promise<TimeSlot[]>;

  /**
   * Gets tutor availability summary for a specific day
   * @param tutorId The tutor's ID
   * @param dayOfWeek The day of the week
   * @returns Promise<AvailabilitySummary> Availability summary
   */
  getTutorAvailability(tutorId: string, dayOfWeek: DayOfWeek): Promise<AvailabilitySummary>;

  /**
   * Gets tutor's weekly availability summary
   * @param tutorId The tutor's ID
   * @returns Promise<WeeklyAvailability> Weekly availability summary
   */
  getWeeklyAvailability(tutorId: string): Promise<WeeklyAvailability>;

  /**
   * Finds tutors available at a specific time
   * @param dayOfWeek The day of the week
   * @param time Time in HH:MM format
   * @returns Promise<string[]> Array of tutor IDs available at that time
   */
  findAvailableTutorsAtTime(dayOfWeek: DayOfWeek, time: string): Promise<string[]>;

  /**
   * Gets time slot statistics for a tutor
   * @param tutorId The tutor's ID
   * @returns Promise<TimeSlotStats> Statistics object
   */
  getTimeSlotStats(tutorId: string): Promise<TimeSlotStats>;

  /**
   * Bulk saves multiple time slots
   * @param timeSlots Array of time slots to save
   * @returns Promise<TimeSlot[]> Array of saved time slots
   */
  bulkSave(timeSlots: TimeSlot[]): Promise<TimeSlot[]>;

  /**
   * Deletes a time slot
   * @param id The time slot ID
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;

  /**
   * Deletes all time slots for a tutor
   * @param tutorId The tutor's ID
   * @returns Promise<void>
   */
  deleteByTutorId(tutorId: string): Promise<void>;

  /**
   * Checks if a time slot exists
   * @param id The time slot ID
   * @returns Promise<boolean> True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Interface for availability summary for a specific day
 */
export interface AvailabilitySummary {
  dayOfWeek: DayOfWeek;
  totalSlots: number;
  availableSlots: number;
  unavailableSlots: number;
  totalHours: number;
  availableHours: number;
  timeSlots: TimeSlot[];
}

/**
 * Interface for weekly availability summary
 */
export interface WeeklyAvailability {
  tutorId: string;
  totalWeeklyHours: number;
  availableWeeklyHours: number;
  dailyAvailability: AvailabilitySummary[];
}

/**
 * Interface for time slot statistics
 */
export interface TimeSlotStats {
  totalSlots: number;
  activeSlots: number;
  inactiveSlots: number;
  expiredSlots: number;
  totalWeeklyHours: number;
  averageSlotDuration: number;
  slotsByDay: DaySlotCount[];
}

/**
 * Interface for slot count by day
 */
export interface DaySlotCount {
  dayOfWeek: DayOfWeek;
  dayName: string;
  count: number;
  totalHours: number;
}
