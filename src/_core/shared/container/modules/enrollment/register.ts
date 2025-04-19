import { Container } from 'inversify';
import { useCases, repositories } from './symbols';

// Import implementations
import type { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository';
import { FirebaseEnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/implementations/FirebaseEnrollmentRepository';
import { EnrollInCourseUseCase } from '@/_core/modules/enrollment/core/use-cases/enroll-in-course/enroll-in-course.use-case';
import { CancelEnrollmentUseCase } from '@/_core/modules/enrollment/core/use-cases/cancel-enrollment/cancel-enrollment.use-case';

/**
 * Register Enrollment module dependencies
 * @param container The DI container
 */
export function registerEnrollmentModule(container: Container): void {
  // Register repositories
  container.bind<EnrollmentRepository>(repositories.EnrollmentRepository).to(FirebaseEnrollmentRepository);
  
  // Register use cases
  container.bind(useCases.EnrollInCourseUseCase).to(EnrollInCourseUseCase);
  container.bind(useCases.CancelEnrollmentUseCase).to(CancelEnrollmentUseCase);
}
