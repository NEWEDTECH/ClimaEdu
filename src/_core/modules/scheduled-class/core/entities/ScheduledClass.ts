/**
 * Enum representing the status of a scheduled class
 * COMPLETED is derived from the scheduled date (see hasOccurred), so it is not persisted
 */
export enum ScheduledClassStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED'
}

/**
 * Tolerance (in ms) after the scheduled time before a class is considered "occurred"
 */
const CLASS_OCCURRED_TOLERANCE_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * ScheduledClass entity representing a live class scheduled by a tutor for a whole class (turma)
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class ScheduledClass {
  private constructor(
    readonly id: string,
    readonly tutorId: string,
    readonly classId: string,
    readonly courseId: string,
    readonly institutionId: string,
    public scheduledDate: Date,
    public meetingUrl: string,
    public status: ScheduledClassStatus,
    readonly createdAt: Date,
    public updatedAt: Date,
    public title?: string,
    public cancelReason?: string
  ) {}

  /**
   * Creates a new ScheduledClass instance
   * @param params ScheduledClass properties
   * @returns A new ScheduledClass instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    tutorId: string;
    classId: string;
    courseId: string;
    institutionId: string;
    scheduledDate: Date;
    meetingUrl: string;
    title?: string;
  }): ScheduledClass {
    this.validateRequiredString(params.id, 'ID da aula');
    this.validateRequiredString(params.tutorId, 'ID do tutor');
    this.validateRequiredString(params.classId, 'ID da turma');
    this.validateRequiredString(params.courseId, 'ID do curso');
    this.validateRequiredString(params.institutionId, 'ID da instituição');
    this.validateScheduledDate(params.scheduledDate);
    this.validateMeetingUrl(params.meetingUrl);

    const now = new Date();

    return new ScheduledClass(
      params.id,
      params.tutorId,
      params.classId,
      params.courseId,
      params.institutionId,
      params.scheduledDate,
      params.meetingUrl.trim(),
      ScheduledClassStatus.SCHEDULED,
      now,
      now,
      params.title?.trim() || undefined
    );
  }

  /**
   * Creates a ScheduledClass instance from existing data (e.g., from database)
   * @param params Complete ScheduledClass data
   * @returns A ScheduledClass instance with all fields preserved
   */
  public static fromData(params: {
    id: string;
    tutorId: string;
    classId: string;
    courseId: string;
    institutionId: string;
    scheduledDate: Date;
    meetingUrl: string;
    status: ScheduledClassStatus;
    createdAt: Date;
    updatedAt: Date;
    title?: string;
    cancelReason?: string;
  }): ScheduledClass {
    return new ScheduledClass(
      params.id,
      params.tutorId,
      params.classId,
      params.courseId,
      params.institutionId,
      params.scheduledDate,
      params.meetingUrl,
      params.status,
      params.createdAt,
      params.updatedAt,
      params.title,
      params.cancelReason
    );
  }

  /**
   * Updates the editable details of the scheduled class (date, meeting URL and title)
   * @param params Fields to update
   */
  public updateDetails(params: {
    scheduledDate?: Date;
    meetingUrl?: string;
    title?: string;
  }): void {
    if (this.status === ScheduledClassStatus.CANCELLED) {
      throw new Error('Não é possível editar uma aula cancelada');
    }

    if (this.hasOccurred()) {
      throw new Error('Não é possível editar uma aula que já aconteceu');
    }

    if (params.scheduledDate) {
      ScheduledClass.validateScheduledDate(params.scheduledDate);
      this.scheduledDate = params.scheduledDate;
    }

    if (params.meetingUrl !== undefined) {
      ScheduledClass.validateMeetingUrl(params.meetingUrl);
      this.meetingUrl = params.meetingUrl.trim();
    }

    if (params.title !== undefined) {
      this.title = params.title.trim() || undefined;
    }

    this.touch();
  }

  /**
   * Cancels the scheduled class
   * @param reason Optional reason for cancellation
   */
  public cancel(reason?: string): void {
    if (this.status === ScheduledClassStatus.CANCELLED) {
      throw new Error('A aula já está cancelada');
    }

    if (this.hasOccurred()) {
      throw new Error('Não é possível cancelar uma aula que já aconteceu');
    }

    this.status = ScheduledClassStatus.CANCELLED;
    this.cancelReason = reason?.trim() || undefined;
    this.touch();
  }

  /**
   * Checks if the class is still scheduled and has not happened yet
   */
  public isUpcoming(): boolean {
    return this.status === ScheduledClassStatus.SCHEDULED && !this.hasOccurred();
  }

  /**
   * Checks if the class has already happened (scheduled time + tolerance has passed)
   */
  public hasOccurred(): boolean {
    return this.scheduledDate.getTime() + CLASS_OCCURRED_TOLERANCE_MS < Date.now();
  }

  /**
   * Checks if the class is cancelled
   */
  public isCancelled(): boolean {
    return this.status === ScheduledClassStatus.CANCELLED;
  }

  /**
   * Updates the timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Validates that a required string field is present
   */
  private static validateRequiredString(value: string, fieldName: string): void {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName} é obrigatório`);
    }
  }

  /**
   * Validates that the scheduled date is in the future
   */
  private static validateScheduledDate(date: Date): void {
    if (!date || isNaN(date.getTime())) {
      throw new Error('Data da aula inválida');
    }

    if (date.getTime() <= Date.now()) {
      throw new Error('A data da aula deve ser no futuro');
    }
  }

  /**
   * Validates the meeting URL (Meet, Zoom or any valid http(s) URL)
   */
  private static validateMeetingUrl(url: string): void {
    if (!url || url.trim() === '') {
      throw new Error('O link da reunião é obrigatório');
    }

    const trimmed = url.trim();
    if (!/^https?:\/\/.+/.test(trimmed)) {
      throw new Error('O link da reunião deve ser uma URL válida (http:// ou https://)');
    }
  }
}
