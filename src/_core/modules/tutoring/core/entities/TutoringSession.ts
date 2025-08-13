import { TutoringConfig, TutoringValidation } from '../config/tutoring-config';

/**
 * Enum representing the status of a tutoring session
 */
export enum TutoringSessionStatus {
  REQUESTED = 'REQUESTED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

/**
 * Enum representing the priority level of a tutoring session
 */
export enum SessionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * TutoringSession entity representing a tutoring session in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class TutoringSession {
  private constructor(
    readonly id: string,
    readonly studentId: string,
    readonly tutorId: string,
    readonly courseId: string,
    public scheduledDate: Date,
    public duration: number, // in minutes
    public status: TutoringSessionStatus,
    public studentQuestion: string,
    public priority: SessionPriority,
    readonly createdAt: Date,
    public updatedAt: Date,
    public tutorNotes?: string,
    public sessionSummary?: string,
    public materials?: string[],
    public cancelReason?: string
  ) {}

  /**
   * Creates a new TutoringSession instance
   * @param params TutoringSession properties
   * @returns A new TutoringSession instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    studentId: string;
    tutorId: string;
    courseId: string;
    scheduledDate: Date;
    duration: number;
    studentQuestion: string;
    priority?: SessionPriority;
    createdAt?: Date;
    updatedAt?: Date;
  }): TutoringSession {
    this.validateCreateParams(params);
    
    const now = new Date();
    
    return new TutoringSession(
      params.id,
      params.studentId,
      params.tutorId,
      params.courseId,
      params.scheduledDate,
      params.duration,
      TutoringSessionStatus.REQUESTED,
      params.studentQuestion,
      params.priority ?? SessionPriority.MEDIUM,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Creates a TutoringSession instance from existing data (e.g., from database)
   * @param params Complete TutoringSession data
   * @returns A TutoringSession instance with all fields preserved
   */
  public static fromData(params: {
    id: string;
    studentId: string;
    tutorId: string;
    courseId: string;
    scheduledDate: Date;
    duration: number;
    status: TutoringSessionStatus;
    studentQuestion: string;
    priority: SessionPriority;
    createdAt: Date;
    updatedAt: Date;
    tutorNotes?: string;
    sessionSummary?: string;
    materials?: string[];
    cancelReason?: string;
  }): TutoringSession {
    return new TutoringSession(
      params.id,
      params.studentId,
      params.tutorId,
      params.courseId,
      params.scheduledDate,
      params.duration,
      params.status,
      params.studentQuestion,
      params.priority,
      params.createdAt,
      params.updatedAt,
      params.tutorNotes,
      params.sessionSummary,
      params.materials,
      params.cancelReason
    );
  }

  /**
   * Schedules the session (confirms the request)
   */
  public schedule(): void {
    if (this.status !== TutoringSessionStatus.REQUESTED) {
      throw new Error(TutoringConfig.errors.cannotSchedule);
    }
    
    this.status = TutoringSessionStatus.SCHEDULED;
    this.touch();
  }

  /**
   * Starts the tutoring session
   */
  public start(): void {
    if (this.status !== TutoringSessionStatus.SCHEDULED) {
      throw new Error(TutoringConfig.errors.cannotStart);
    }
    
    this.status = TutoringSessionStatus.IN_PROGRESS;
    this.touch();
  }

  /**
   * Completes the tutoring session
   * @param sessionSummary Summary of what was covered
   * @param materials Optional materials used or recommended
   */
  public complete(sessionSummary: string, materials?: string[]): void {
    if (this.status !== TutoringSessionStatus.IN_PROGRESS) {
      throw new Error(TutoringConfig.errors.cannotComplete);
    }
    
    if (sessionSummary && sessionSummary.length > TutoringConfig.content.maxSummaryLength) {
      throw new Error(`Session summary cannot exceed ${TutoringConfig.content.maxSummaryLength} characters`);
    }
    
    this.status = TutoringSessionStatus.COMPLETED;
    this.sessionSummary = sessionSummary;
    
    if (materials && materials.length > 0) {
      this.materials = materials;
    }
    
    this.touch();
  }

  /**
   * Cancels the tutoring session
   * @param reason Reason for cancellation
   */
  public cancel(reason: string): void {
    if (this.status === TutoringSessionStatus.COMPLETED) {
      throw new Error(TutoringConfig.errors.cannotCancelCompleted);
    }
    
    if (reason && reason.length > TutoringConfig.content.maxCancelReasonLength) {
      throw new Error(`Cancel reason cannot exceed ${TutoringConfig.content.maxCancelReasonLength} characters`);
    }
    
    this.status = TutoringSessionStatus.CANCELLED;
    this.cancelReason = reason;
    this.touch();
  }

  /**
   * Marks the session as no-show
   */
  public markAsNoShow(): void {
    if (this.status !== TutoringSessionStatus.SCHEDULED) {
      throw new Error(TutoringConfig.errors.cannotMarkNoShow);
    }
    
    this.status = TutoringSessionStatus.NO_SHOW;
    this.touch();
  }

  /**
   * Adds tutor notes to the session
   * @param notes Notes from the tutor
   */
  public addTutorNotes(notes: string): void {
    if (notes && notes.length > TutoringConfig.content.maxNotesLength) {
      throw new Error(`Tutor notes cannot exceed ${TutoringConfig.content.maxNotesLength} characters`);
    }
    
    this.tutorNotes = notes;
    this.touch();
  }

  /**
   * Updates the scheduled date and time
   * @param newDate New scheduled date
   */
  public reschedule(newDate: Date): void {
    if (this.status === TutoringSessionStatus.COMPLETED || this.status === TutoringSessionStatus.CANCELLED) {
      throw new Error(TutoringConfig.errors.cannotRescheduleFinished);
    }
    
    // Use centralized validation
    TutoringValidation.validateScheduledDate(newDate);
    
    this.scheduledDate = newDate;
    this.touch();
  }

  /**
   * Updates the session priority
   * @param priority New priority level
   */
  public updatePriority(priority: SessionPriority): void {
    this.priority = priority;
    this.touch();
  }

  /**
   * Checks if the session is active (scheduled or in progress)
   */
  public isActive(): boolean {
    return this.status === TutoringSessionStatus.SCHEDULED || 
           this.status === TutoringSessionStatus.IN_PROGRESS;
  }

  /**
   * Checks if the session is finished (completed, cancelled, or no-show)
   */
  public isFinished(): boolean {
    return this.status === TutoringSessionStatus.COMPLETED || 
           this.status === TutoringSessionStatus.CANCELLED || 
           this.status === TutoringSessionStatus.NO_SHOW;
  }

  /**
   * Checks if the session is overdue (scheduled time has passed but not started)
   */
  public isOverdue(): boolean {
    if (this.status !== TutoringSessionStatus.SCHEDULED) {
      return false;
    }
    
    const sessionEndTime = new Date(this.scheduledDate.getTime() + (this.duration * 60000));
    return sessionEndTime < new Date();
  }

  /**
   * Updates the timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validates the parameters for creating a new session
   */
  private static validateCreateParams(params: {
    id: string;
    studentId: string;
    tutorId: string;
    courseId: string;
    scheduledDate: Date;
    duration: number;
    studentQuestion: string;
  }): void {
    // Use centralized validation
    TutoringValidation.validateRequiredString(params.id, 'Session ID');
    TutoringValidation.validateRequiredString(params.studentId, 'Student ID');
    TutoringValidation.validateRequiredString(params.tutorId, 'Tutor ID');
    TutoringValidation.validateRequiredString(params.courseId, 'Course ID');
    
    if (!params.scheduledDate) {
      throw new Error(TutoringConfig.errors.invalidScheduledDate);
    }
    
    TutoringValidation.validateScheduledDate(params.scheduledDate);
    TutoringValidation.validateDuration(params.duration);
    TutoringValidation.validateQuestion(params.studentQuestion);
  }
}
