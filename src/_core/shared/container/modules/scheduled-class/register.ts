import { Container } from 'inversify';
import { ScheduledClassSymbols } from './symbols';

// Import repository interfaces
import type { ScheduledClassRepository } from '@/_core/modules/scheduled-class/infrastructure/repositories/ScheduledClassRepository';

// Import repository implementations
import { FirebaseScheduledClassRepository } from '@/_core/modules/scheduled-class/infrastructure/repositories/implementations/FirebaseScheduledClassRepository';

// Import use cases
import { ScheduleClassUseCase } from '@/_core/modules/scheduled-class/core/use-cases/tutor/schedule-class/schedule-class.use-case';
import { UpdateScheduledClassUseCase } from '@/_core/modules/scheduled-class/core/use-cases/tutor/update-scheduled-class/update-scheduled-class.use-case';
import { CancelScheduledClassUseCase } from '@/_core/modules/scheduled-class/core/use-cases/tutor/cancel-scheduled-class/cancel-scheduled-class.use-case';
import { ListTutorScheduledClassesUseCase } from '@/_core/modules/scheduled-class/core/use-cases/tutor/list-tutor-scheduled-classes/list-tutor-scheduled-classes.use-case';
import { ListTutorClassesUseCase } from '@/_core/modules/scheduled-class/core/use-cases/tutor/list-tutor-classes/list-tutor-classes.use-case';
import { ListStudentScheduledClassesUseCase } from '@/_core/modules/scheduled-class/core/use-cases/student/list-student-scheduled-classes/list-student-scheduled-classes.use-case';

/**
 * Registers all scheduled-class module dependencies in the DI container
 * @param container The Inversify container instance
 */
export function registerScheduledClassModule(container: Container): void {
  // Register repositories
  container
    .bind<ScheduledClassRepository>(ScheduledClassSymbols.repositories.ScheduledClassRepository)
    .to(FirebaseScheduledClassRepository)
    .inSingletonScope();

  // Register use cases
  container
    .bind<ScheduleClassUseCase>(ScheduledClassSymbols.useCases.ScheduleClassUseCase)
    .to(ScheduleClassUseCase)
    .inTransientScope();

  container
    .bind<UpdateScheduledClassUseCase>(ScheduledClassSymbols.useCases.UpdateScheduledClassUseCase)
    .to(UpdateScheduledClassUseCase)
    .inTransientScope();

  container
    .bind<CancelScheduledClassUseCase>(ScheduledClassSymbols.useCases.CancelScheduledClassUseCase)
    .to(CancelScheduledClassUseCase)
    .inTransientScope();

  container
    .bind<ListTutorScheduledClassesUseCase>(ScheduledClassSymbols.useCases.ListTutorScheduledClassesUseCase)
    .to(ListTutorScheduledClassesUseCase)
    .inTransientScope();

  container
    .bind<ListTutorClassesUseCase>(ScheduledClassSymbols.useCases.ListTutorClassesUseCase)
    .to(ListTutorClassesUseCase)
    .inTransientScope();

  container
    .bind<ListStudentScheduledClassesUseCase>(ScheduledClassSymbols.useCases.ListStudentScheduledClassesUseCase)
    .to(ListStudentScheduledClassesUseCase)
    .inTransientScope();
}
