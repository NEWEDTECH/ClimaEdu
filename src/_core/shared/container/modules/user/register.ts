import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import implementations
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { FirebaseUserRepository } from '@/_core/modules/user/infrastructure/repositories/implementations/FirebaseUserRepository';
import { CreateUserUseCase } from '@/_core/modules/user/core/use-cases/create-user/create-user.use-case';
import { CreateSuperAdminUseCase } from '@/_core/modules/user/core/use-cases/create-super-admin/create-super-admin.use-case';
// import { AuthenticateUserUseCase } from '@/_core/modules/user/core/use-cases/authenticate-user/authenticate-user.use-case';

/**
 * Register User module dependencies
 * @param container The DI container
 */
export function registerUserModule(container: Container): void {
  // Register repositories
  container.bind<UserRepository>(repositories.UserRepository).to(FirebaseUserRepository);
  
  // Register use cases
  container.bind(useCases.CreateUserUseCase).to(CreateUserUseCase);
  container.bind(useCases.CreateSuperAdminUseCase).to(CreateSuperAdminUseCase);
  // container.bind(useCases.AuthenticateUserUseCase).to(AuthenticateUserUseCase);
}
