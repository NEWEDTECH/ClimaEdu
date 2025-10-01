import { Container } from 'inversify';
import { useCases, repositories } from './symbols';

// Import implementations
import type { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository';
import type { ClassRepository } from '@/_core/modules/enrollment/infrastructure/repositories/ClassRepository';
import { FirebaseEnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/implementations/FirebaseEnrollmentRepository';
import { FirebaseClassRepository } from '@/_core/modules/enrollment/infrastructure/repositories/implementations/FirebaseClassRepository';
import { EnrollInCourseUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-course/enroll-in-course.use-case';
import { CancelEnrollmentUseCase } from '@/_core/modules/enrollment/core/use-cases/cancel-enrollment/cancel-enrollment.use-case';
import { ListEnrollmentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.use-case';
import { CreateClassUseCase } from '@/_core/modules/enrollment/core/use-cases/create-class/create-class.use-case';
import { UpdateClassUseCase } from '@/_core/modules/enrollment/core/use-cases/update-class/update-class.use-case';
import { GetClassUseCase } from '@/_core/modules/enrollment/core/use-cases/get-class/get-class.use-case';
import { ListClassesUseCase } from '@/_core/modules/enrollment/core/use-cases/list-classes/list-classes.use-case';
import { DeleteClassUseCase } from '@/_core/modules/enrollment/core/use-cases/delete-class/delete-class.use-case';
import { AddEnrollmentToClassUseCase } from '@/_core/modules/enrollment/core/use-cases/add-enrollment-to-class/add-enrollment-to-class.use-case';
import { RemoveEnrollmentFromClassUseCase } from '@/_core/modules/enrollment/core/use-cases/remove-enrollment-from-class/remove-enrollment-from-class.use-case';
import { EnrollInTrailUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-trail/enroll-in-trail.use-case';
import { ListClassStudentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-class-students';
import { CompleteCourseUseCase } from '@/_core/modules/enrollment/core/use-cases/complete-course/complete-course.use-case';

/**
 * Register Enrollment module dependencies
 * @param container The DI container
 */
export function registerEnrollmentModule(container: Container): void {
  // Register repositories
  container.bind<EnrollmentRepository>(repositories.EnrollmentRepository).to(FirebaseEnrollmentRepository);
  container.bind<ClassRepository>(repositories.ClassRepository).to(FirebaseClassRepository);
  
  // Register use cases
  container.bind(useCases.EnrollInCourseUseCase).to(EnrollInCourseUseCase);
  container.bind(useCases.CancelEnrollmentUseCase).to(CancelEnrollmentUseCase);
  container.bind(useCases.ListEnrollmentsUseCase).to(ListEnrollmentsUseCase);
  container.bind(useCases.CreateClassUseCase).to(CreateClassUseCase);
  container.bind(useCases.UpdateClassUseCase).to(UpdateClassUseCase);
  container.bind(useCases.GetClassUseCase).to(GetClassUseCase);
  container.bind(useCases.ListClassesUseCase).to(ListClassesUseCase);
  container.bind(useCases.DeleteClassUseCase).to(DeleteClassUseCase);
  container.bind(useCases.AddEnrollmentToClassUseCase).to(AddEnrollmentToClassUseCase);
  container.bind(useCases.RemoveEnrollmentFromClassUseCase).to(RemoveEnrollmentFromClassUseCase);
  container.bind(useCases.EnrollInTrailUseCase).to(EnrollInTrailUseCase);
  container.bind(useCases.CompleteCourseUseCase).to(CompleteCourseUseCase);
  container.bind(ListClassStudentsUseCase).toSelf();
}
