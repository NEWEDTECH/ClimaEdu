// This file serves as the public API for the Tutoring module

// Re-export configuration
export * from './core/config/tutoring-config';

// Re-export entities
export * from './core/entities/TutoringSession';
export * from './core/entities/TimeSlot';
export * from './core/entities/SessionReview';

// Re-export use cases - Student
export * from './core/use-cases/student/schedule-tutoring-session/schedule-tutoring-session.use-case';
export * from './core/use-cases/student/schedule-tutoring-session/schedule-tutoring-session.input';
export * from './core/use-cases/student/schedule-tutoring-session/schedule-tutoring-session.output';
export * from './core/use-cases/student/get-student-sessions/get-student-sessions.use-case';
export * from './core/use-cases/student/get-student-sessions/get-student-sessions.input';
export * from './core/use-cases/student/get-student-sessions/get-student-sessions.output';
export * from './core/use-cases/student/cancel-tutoring-session/cancel-tutoring-session.use-case';
export * from './core/use-cases/student/cancel-tutoring-session/cancel-tutoring-session.input';
export * from './core/use-cases/student/cancel-tutoring-session/cancel-tutoring-session.output';
export * from './core/use-cases/student/get-student-enrolled-courses/get-student-enrolled-courses.use-case';
export * from './core/use-cases/student/get-student-enrolled-courses/get-student-enrolled-courses.input';
export * from './core/use-cases/student/get-student-enrolled-courses/get-student-enrolled-courses.output';

// Re-export use cases - Tutor
export * from './core/use-cases/tutor/get-tutor-sessions/get-tutor-sessions.use-case';
export * from './core/use-cases/tutor/get-tutor-sessions/get-tutor-sessions.input';
export * from './core/use-cases/tutor/get-tutor-sessions/get-tutor-sessions.output';
export * from './core/use-cases/tutor/update-session-status/update-session-status.use-case';
export * from './core/use-cases/tutor/update-session-status/update-session-status.input';
export * from './core/use-cases/tutor/update-session-status/update-session-status.output';
export * from './core/use-cases/tutor/add-session-notes/add-session-notes.use-case';
export * from './core/use-cases/tutor/add-session-notes/add-session-notes.input';
export * from './core/use-cases/tutor/add-session-notes/add-session-notes.output';

// Re-export use cases - Shared
export * from './core/use-cases/shared/get-session-details/get-session-details.use-case';
export * from './core/use-cases/shared/get-session-details/get-session-details.input';
export * from './core/use-cases/shared/get-session-details/get-session-details.output';

// Re-export repository interfaces
export * from './infrastructure/repositories/TutoringSessionRepository';
export * from './infrastructure/repositories/TimeSlotRepository';
export * from './infrastructure/repositories/SessionReviewRepository';

// Re-export repository implementations
export * from './infrastructure/repositories/implementations/FirebaseTutoringSessionRepository';
