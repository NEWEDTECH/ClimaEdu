/**
 * Enum representing the days of the week
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

/**
 * TimeSlot entity representing available time slots for tutoring
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class TimeSlot {
  private constructor(
    readonly id: string,
    readonly tutorId: string,
    public dayOfWeek: DayOfWeek,
    public startTime: string, // Format: "HH:MM" (24-hour format)
    public endTime: string,   // Format: "HH:MM" (24-hour format)
    public isAvailable: boolean,
    readonly createdAt: Date,
    public updatedAt: Date,
    public recurrenceEndDate?: Date // When this recurring slot ends
  ) {}

  /**
   * Creates a new TimeSlot instance
   * @param params TimeSlot properties
   * @returns A new TimeSlot instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    tutorId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    recurrenceEndDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): TimeSlot {
    this.validateCreateParams(params);
    
    const now = new Date();
    
    return new TimeSlot(
      params.id,
      params.tutorId,
      params.dayOfWeek,
      params.startTime,
      params.endTime,
      true, // New time slots are available by default
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.recurrenceEndDate
    );
  }

  /**
   * Updates the time slot availability
   * @param isAvailable New availability status
   */
  public setAvailability(isAvailable: boolean): void {
    this.isAvailable = isAvailable;
    this.touch();
  }

  /**
   * Updates the start time
   * @param startTime New start time in HH:MM format
   */
  public updateStartTime(startTime: string): void {
    this.validateTimeFormat(startTime, 'Start time');
    
    if (this.isTimeAfterOrEqual(startTime, this.endTime)) {
      throw new Error('Start time must be before end time');
    }
    
    this.startTime = startTime;
    this.touch();
  }

  /**
   * Updates the end time
   * @param endTime New end time in HH:MM format
   */
  public updateEndTime(endTime: string): void {
    this.validateTimeFormat(endTime, 'End time');
    
    if (this.isTimeAfterOrEqual(this.startTime, endTime)) {
      throw new Error('End time must be after start time');
    }
    
    this.endTime = endTime;
    this.touch();
  }

  /**
   * Updates both start and end times
   * @param startTime New start time in HH:MM format
   * @param endTime New end time in HH:MM format
   */
  public updateTimeRange(startTime: string, endTime: string): void {
    this.validateTimeFormat(startTime, 'Start time');
    this.validateTimeFormat(endTime, 'End time');
    
    if (this.isTimeAfterOrEqual(startTime, endTime)) {
      throw new Error('Start time must be before end time');
    }
    
    this.startTime = startTime;
    this.endTime = endTime;
    this.touch();
  }

  /**
   * Updates the day of the week
   * @param dayOfWeek New day of the week
   */
  public updateDayOfWeek(dayOfWeek: DayOfWeek): void {
    this.dayOfWeek = dayOfWeek;
    this.touch();
  }

  /**
   * Sets the recurrence end date
   * @param endDate When this recurring slot should end
   */
  public setRecurrenceEndDate(endDate: Date): void {
    if (endDate <= new Date()) {
      throw new Error('Recurrence end date must be in the future');
    }
    
    this.recurrenceEndDate = endDate;
    this.touch();
  }

  /**
   * Removes the recurrence end date (makes it indefinite)
   */
  public removeRecurrenceEndDate(): void {
    this.recurrenceEndDate = undefined;
    this.touch();
  }

  /**
   * Gets the duration of the time slot in minutes
   */
  public getDurationInMinutes(): number {
    const startMinutes = this.timeToMinutes(this.startTime);
    const endMinutes = this.timeToMinutes(this.endTime);
    return endMinutes - startMinutes;
  }

  /**
   * Gets the duration of the time slot in hours
   */
  public getDurationInHours(): number {
    return this.getDurationInMinutes() / 60;
  }

  /**
   * Checks if this time slot overlaps with another time slot
   * @param other The other time slot to check against
   */
  public overlapsWith(other: TimeSlot): boolean {
    if (this.dayOfWeek !== other.dayOfWeek) {
      return false;
    }
    
    const thisStart = this.timeToMinutes(this.startTime);
    const thisEnd = this.timeToMinutes(this.endTime);
    const otherStart = this.timeToMinutes(other.startTime);
    const otherEnd = this.timeToMinutes(other.endTime);
    
    return thisStart < otherEnd && otherStart < thisEnd;
  }

  /**
   * Checks if a specific time falls within this time slot
   * @param time Time in HH:MM format
   */
  public containsTime(time: string): boolean {
    this.validateTimeFormat(time, 'Time');
    
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(this.startTime);
    const endMinutes = this.timeToMinutes(this.endTime);
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  /**
   * Checks if the time slot is currently active (recurring and not expired)
   */
  public isCurrentlyActive(): boolean {
    if (!this.isAvailable) {
      return false;
    }
    
    if (this.recurrenceEndDate && this.recurrenceEndDate <= new Date()) {
      return false;
    }
    
    return true;
  }

  /**
   * Gets the day name as string
   */
  public getDayName(): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[this.dayOfWeek];
  }

  /**
   * Formats the time slot as a readable string
   */
  public toString(): string {
    return `${this.getDayName()} ${this.startTime}-${this.endTime}`;
  }

  /**
   * Updates the timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Converts time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Checks if time1 is after or equal to time2
   */
  private isTimeAfterOrEqual(time1: string, time2: string): boolean {
    return this.timeToMinutes(time1) >= this.timeToMinutes(time2);
  }

  /**
   * Validates time format (HH:MM)
   */
  private validateTimeFormat(time: string, fieldName: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(time)) {
      throw new Error(`${fieldName} must be in HH:MM format (24-hour)`);
    }
  }

  /**
   * Validates the parameters for creating a new time slot
   */
  private static validateCreateParams(params: {
    id: string;
    tutorId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    recurrenceEndDate?: Date;
  }): void {
    if (!params.id || params.id.trim() === '') {
      throw new Error('TimeSlot ID is required');
    }
    
    if (!params.tutorId || params.tutorId.trim() === '') {
      throw new Error('Tutor ID is required');
    }
    
    if (params.dayOfWeek < 0 || params.dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
    
    // Validate time formats
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(params.startTime)) {
      throw new Error('Start time must be in HH:MM format (24-hour)');
    }
    
    if (!timeRegex.test(params.endTime)) {
      throw new Error('End time must be in HH:MM format (24-hour)');
    }
    
    // Validate time range
    const startMinutes = TimeSlot.prototype.timeToMinutes.call(null, params.startTime);
    const endMinutes = TimeSlot.prototype.timeToMinutes.call(null, params.endTime);
    
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
    
    if (params.recurrenceEndDate && params.recurrenceEndDate <= new Date()) {
      throw new Error('Recurrence end date must be in the future');
    }
  }
}
