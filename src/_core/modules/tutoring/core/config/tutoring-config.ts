/**
 * Tutoring module configuration constants
 * Centralizes all business rules and limits to avoid hardcoding
 */
export const TutoringConfig = {
  /**
   * Session duration limits (in minutes)
   */
  session: {
    minDuration: 15,
    maxDuration: 240, // 4 hours
    defaultDuration: 60, // 1 hour
  },

  /**
   * Scheduling constraints
   */
  scheduling: {
    minAdvanceHours: 1, // Minimum hours in advance to schedule
    maxAdvanceMonths: 3, // Maximum months in advance to schedule
    bufferMinutes: 15, // Buffer time between sessions
  },

  /**
   * Content limits
   */
  content: {
    maxQuestionLength: 1000,
    maxNotesLength: 2000,
    maxSummaryLength: 1500,
    maxCancelReasonLength: 500,
  },

  /**
   * Business rules
   */
  rules: {
    allowStudentConflicts: false, // Whether students can have overlapping sessions
    allowSameDayRescheduling: false, // Whether sessions can be rescheduled on the same day
    requireTutorApproval: true, // Whether tutor approval is required for scheduling
  },

  /**
   * Error messages
   */
  errors: {
    // Validation errors
    invalidSessionId: 'Session ID is required and must be valid',
    invalidStudentId: 'Student ID is required and must be valid',
    invalidTutorId: 'Tutor ID is required and must be valid',
    invalidSubjectId: 'Subject ID is required and must be valid',
    invalidCourseId: 'Course ID is required and must be valid',
    invalidScheduledDate: 'Scheduled date is required and must be in the future',
    invalidDuration: 'Duration must be between {min} and {max} minutes',
    invalidQuestion: 'Student question is required and cannot exceed {max} characters',
    
    // Scheduling errors
    pastDate: 'Scheduled date must be in the future',
    tooFarInFuture: 'Cannot schedule sessions more than {months} months in advance',
    insufficientAdvanceNotice: 'Sessions must be scheduled at least {hours} hour(s) in advance',
    
    // Conflict errors
    tutorConflict: 'Tutor is not available at the requested time',
    studentConflict: 'You already have a session scheduled at this time',
    
    // Subject errors
    subjectNotFound: 'Subject not found',
    subjectInactive: 'Subject is not available for tutoring',
    
    // State transition errors
    cannotSchedule: 'Only requested sessions can be scheduled',
    cannotStart: 'Only scheduled sessions can be started',
    cannotComplete: 'Only in-progress sessions can be completed',
    cannotCancelCompleted: 'Completed sessions cannot be cancelled',
    cannotMarkNoShow: 'Only scheduled sessions can be marked as no-show',
    cannotRescheduleFinished: 'Completed or cancelled sessions cannot be rescheduled',
  },

  /**
   * Success messages
   */
  messages: {
    sessionScheduled: 'Tutoring session scheduled successfully',
    sessionStarted: 'Tutoring session started successfully',
    sessionCompleted: 'Tutoring session completed successfully',
    sessionCancelled: 'Tutoring session cancelled successfully',
    sessionRescheduled: 'Tutoring session rescheduled successfully',
  },
} as const;

/**
 * Helper function to format error messages with parameters
 * @param template Error message template
 * @param params Parameters to replace in the template
 * @returns Formatted error message
 */
export function formatErrorMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (message, [key, value]) => message.replace(`{${key}}`, String(value)),
    template
  );
}

/**
 * Validation helper functions
 */
export const TutoringValidation = {
  /**
   * Validates session duration
   * @param duration Duration in minutes
   * @returns True if valid, throws error if invalid
   */
  validateDuration(duration: number): boolean {
    if (!duration || duration < TutoringConfig.session.minDuration || duration > TutoringConfig.session.maxDuration) {
      throw new Error(
        formatErrorMessage(TutoringConfig.errors.invalidDuration, {
          min: TutoringConfig.session.minDuration,
          max: TutoringConfig.session.maxDuration,
        })
      );
    }
    return true;
  },

  /**
   * Validates scheduled date
   * @param scheduledDate The proposed date
   * @returns True if valid, throws error if invalid
   */
  validateScheduledDate(scheduledDate: Date): boolean {
    const now = new Date();
    
    if (scheduledDate <= now) {
      throw new Error(TutoringConfig.errors.pastDate);
    }

    // Check minimum advance notice
    const minAdvanceTime = new Date();
    minAdvanceTime.setHours(minAdvanceTime.getHours() + TutoringConfig.scheduling.minAdvanceHours);
    
    if (scheduledDate < minAdvanceTime) {
      throw new Error(
        formatErrorMessage(TutoringConfig.errors.insufficientAdvanceNotice, {
          hours: TutoringConfig.scheduling.minAdvanceHours,
        })
      );
    }

    // Check maximum advance time
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + TutoringConfig.scheduling.maxAdvanceMonths);
    
    if (scheduledDate > maxFutureDate) {
      throw new Error(
        formatErrorMessage(TutoringConfig.errors.tooFarInFuture, {
          months: TutoringConfig.scheduling.maxAdvanceMonths,
        })
      );
    }

    return true;
  },

  /**
   * Validates student question
   * @param question The student's question
   * @returns True if valid, throws error if invalid
   */
  validateQuestion(question: string): boolean {
    if (!question || question.trim() === '') {
      throw new Error(TutoringConfig.errors.invalidQuestion.replace('{max}', String(TutoringConfig.content.maxQuestionLength)));
    }

    if (question.length > TutoringConfig.content.maxQuestionLength) {
      throw new Error(
        formatErrorMessage(TutoringConfig.errors.invalidQuestion, {
          max: TutoringConfig.content.maxQuestionLength,
        })
      );
    }

    return true;
  },

  /**
   * Validates required string field
   * @param value The value to validate
   * @param fieldName The name of the field for error messages
   * @returns True if valid, throws error if invalid
   */
  validateRequiredString(value: string, fieldName: string): boolean {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName} is required and must be valid`);
    }
    return true;
  },
};
