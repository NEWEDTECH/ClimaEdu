/**
 * Symbols for ScheduledClass module dependency injection
 */
export const ScheduledClassSymbols = {
  repositories: {
    ScheduledClassRepository: Symbol.for('ScheduledClassRepository'),
  },
  useCases: {
    // Tutor use cases
    ScheduleClassUseCase: Symbol.for('ScheduleClassUseCase'),
    UpdateScheduledClassUseCase: Symbol.for('UpdateScheduledClassUseCase'),
    CancelScheduledClassUseCase: Symbol.for('CancelScheduledClassUseCase'),
    ListTutorScheduledClassesUseCase: Symbol.for('ListTutorScheduledClassesUseCase'),
    ListTutorClassesUseCase: Symbol.for('ListTutorClassesUseCase'),

    // Student use cases
    ListStudentScheduledClassesUseCase: Symbol.for('ListStudentScheduledClassesUseCase'),
  },
};
