/**
 * Symbols for Tutoring module dependency injection
 */
export const TutoringSymbols = {
  repositories: {
    TutoringSessionRepository: Symbol.for('TutoringSessionRepository'),
    TimeSlotRepository: Symbol.for('TimeSlotRepository'),
    SessionReviewRepository: Symbol.for('SessionReviewRepository'),
  },
  useCases: {
    // Student use cases
    ScheduleTutoringSessionUseCase: Symbol.for('ScheduleTutoringSessionUseCase'),
    CancelTutoringSessionUseCase: Symbol.for('CancelTutoringSessionUseCase'),
    GetStudentSessionsUseCase: Symbol.for('GetStudentSessionsUseCase'),
    GetStudentEnrolledCoursesUseCase: Symbol.for('GetStudentEnrolledCoursesUseCase'),
    ReviewTutorUseCase: Symbol.for('ReviewTutorUseCase'),
    FindAvailableTimeSlotsUseCase: Symbol.for('FindAvailableTimeSlotsUseCase'),
    
    // Tutor use cases
    GetTutorSessionsUseCase: Symbol.for('GetTutorSessionsUseCase'),
    UpdateSessionStatusUseCase: Symbol.for('UpdateSessionStatusUseCase'),
    UpdateTutoringSessionUseCase: Symbol.for('UpdateTutoringSessionUseCase'),
    AddSessionNotesUseCase: Symbol.for('AddSessionNotesUseCase'),
    SetAvailabilityUseCase: Symbol.for('SetAvailabilityUseCase'),
    CreateTimeSlotUseCase: Symbol.for('CreateTimeSlotUseCase'),
    
    // Shared use cases
    GetSessionDetailsUseCase: Symbol.for('GetSessionDetailsUseCase'),
  },
};
