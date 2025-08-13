/**
 * Symbols for Tutoring module dependency injection
 */
export const TutoringSymbols = {
  repositories: {
    TutoringSessionRepository: Symbol.for('TutoringSessionRepository'),
    SubjectRepository: Symbol.for('SubjectRepository'),
    TimeSlotRepository: Symbol.for('TimeSlotRepository'),
    SessionReviewRepository: Symbol.for('SessionReviewRepository'),
  },
  useCases: {
    // Student use cases
    ScheduleTutoringSessionUseCase: Symbol.for('ScheduleTutoringSessionUseCase'),
    CancelTutoringSessionUseCase: Symbol.for('CancelTutoringSessionUseCase'),
    GetStudentSessionsUseCase: Symbol.for('GetStudentSessionsUseCase'),
    ReviewTutorUseCase: Symbol.for('ReviewTutorUseCase'),
    
    // Tutor use cases
    GetTutorSessionsUseCase: Symbol.for('GetTutorSessionsUseCase'),
    UpdateSessionStatusUseCase: Symbol.for('UpdateSessionStatusUseCase'),
    AddSessionNotesUseCase: Symbol.for('AddSessionNotesUseCase'),
    SetAvailabilityUseCase: Symbol.for('SetAvailabilityUseCase'),
    
    // Shared use cases
    GetAvailableSubjectsUseCase: Symbol.for('GetAvailableSubjectsUseCase'),
    GetSessionDetailsUseCase: Symbol.for('GetSessionDetailsUseCase'),
  },
};
