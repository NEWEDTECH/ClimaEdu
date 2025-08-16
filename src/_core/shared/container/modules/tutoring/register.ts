import { Container } from 'inversify';
import { TutoringSymbols } from './symbols';

// Import repository interfaces
import type { TutoringSessionRepository } from '@/_core/modules/tutoring/infrastructure/repositories/TutoringSessionRepository';
import type { TimeSlotRepository } from '@/_core/modules/tutoring/infrastructure/repositories/TimeSlotRepository';

// Import repository implementations
import { FirebaseTutoringSessionRepository } from '@/_core/modules/tutoring/infrastructure/repositories/implementations/FirebaseTutoringSessionRepository';
import { FirebaseTimeSlotRepository } from '@/_core/modules/tutoring/infrastructure/repositories/implementations/FirebaseTimeSlotRepository';

// Import use cases
import { ScheduleTutoringSessionUseCase } from '@/_core/modules/tutoring/core/use-cases/student/schedule-tutoring-session/schedule-tutoring-session.use-case';
import { GetStudentSessionsUseCase } from '@/_core/modules/tutoring/core/use-cases/student/get-student-sessions/get-student-sessions.use-case';
import { CancelTutoringSessionUseCase } from '@/_core/modules/tutoring/core/use-cases/student/cancel-tutoring-session/cancel-tutoring-session.use-case';
import { GetTutorSessionsUseCase } from '@/_core/modules/tutoring/core/use-cases/tutor/get-tutor-sessions/get-tutor-sessions.use-case';
import { UpdateSessionStatusUseCase } from '@/_core/modules/tutoring/core/use-cases/tutor/update-session-status/update-session-status.use-case';
import { UpdateTutoringSessionUseCase } from '@/_core/modules/tutoring/core/use-cases/tutor/update-tutoring-session/update-tutoring-session.use-case';
import { AddSessionNotesUseCase } from '@/_core/modules/tutoring/core/use-cases/tutor/add-session-notes/add-session-notes.use-case';
import { GetStudentEnrolledCoursesUseCase } from '@/_core/modules/tutoring/core/use-cases/student/get-student-enrolled-courses/get-student-enrolled-courses.use-case';
import { GetSessionDetailsUseCase } from '@/_core/modules/tutoring/core/use-cases/shared/get-session-details/get-session-details.use-case';
import { CreateTimeSlotUseCase } from '@/_core/modules/tutoring/core/use-cases/tutor/create-time-slot/create-time-slot.use-case';
import { FindAvailableTimeSlotsUseCase } from '@/_core/modules/tutoring/core/use-cases/student/find-available-time-slots/find-available-time-slots.use-case';

/**
 * Registers all tutoring module dependencies in the DI container
 * @param container The Inversify container instance
 */
export function registerTutoringModule(container: Container): void {
  // Register repositories
  container
    .bind<TutoringSessionRepository>(TutoringSymbols.repositories.TutoringSessionRepository)
    .to(FirebaseTutoringSessionRepository)
    .inSingletonScope();

  container
    .bind<TimeSlotRepository>(TutoringSymbols.repositories.TimeSlotRepository)
    .to(FirebaseTimeSlotRepository)
    .inSingletonScope();

  // Register use cases
  container
    .bind<ScheduleTutoringSessionUseCase>(TutoringSymbols.useCases.ScheduleTutoringSessionUseCase)
    .to(ScheduleTutoringSessionUseCase)
    .inTransientScope();

  container
    .bind<GetStudentSessionsUseCase>(TutoringSymbols.useCases.GetStudentSessionsUseCase)
    .to(GetStudentSessionsUseCase)
    .inTransientScope();

  container
    .bind<CancelTutoringSessionUseCase>(TutoringSymbols.useCases.CancelTutoringSessionUseCase)
    .to(CancelTutoringSessionUseCase)
    .inTransientScope();

  container
    .bind<GetTutorSessionsUseCase>(TutoringSymbols.useCases.GetTutorSessionsUseCase)
    .to(GetTutorSessionsUseCase)
    .inTransientScope();

  container
    .bind<UpdateSessionStatusUseCase>(TutoringSymbols.useCases.UpdateSessionStatusUseCase)
    .to(UpdateSessionStatusUseCase)
    .inTransientScope();

  container
    .bind<UpdateTutoringSessionUseCase>(TutoringSymbols.useCases.UpdateTutoringSessionUseCase)
    .to(UpdateTutoringSessionUseCase)
    .inTransientScope();

  container
    .bind<AddSessionNotesUseCase>(TutoringSymbols.useCases.AddSessionNotesUseCase)
    .to(AddSessionNotesUseCase)
    .inTransientScope();

  container
    .bind<GetStudentEnrolledCoursesUseCase>(TutoringSymbols.useCases.GetStudentEnrolledCoursesUseCase)
    .to(GetStudentEnrolledCoursesUseCase)
    .inTransientScope();

  container
    .bind<GetSessionDetailsUseCase>(TutoringSymbols.useCases.GetSessionDetailsUseCase)
    .to(GetSessionDetailsUseCase)
    .inTransientScope();

  container
    .bind<CreateTimeSlotUseCase>(TutoringSymbols.useCases.CreateTimeSlotUseCase)
    .to(CreateTimeSlotUseCase)
    .inTransientScope();

  container
    .bind<FindAvailableTimeSlotsUseCase>(TutoringSymbols.useCases.FindAvailableTimeSlotsUseCase)
    .to(FindAvailableTimeSlotsUseCase)
    .inTransientScope();

  // Additional use cases and repositories will be registered here as they are implemented
  // This ensures the module remains extensible while maintaining clean production code
}
