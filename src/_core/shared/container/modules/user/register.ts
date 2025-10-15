import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import implementations
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { FirebaseUserRepository } from '@/_core/modules/user/infrastructure/repositories/implementations/FirebaseUserRepository';
import type { UserAccessHistoryRepository } from '@/_core/modules/user/infrastructure/repositories/UserAccessHistoryRepository';
import { FirebaseUserAccessHistoryRepository } from '@/_core/modules/user/infrastructure/repositories/implementations/FirebaseUserAccessHistoryRepository';
import { CreateUserUseCase } from '@/_core/modules/user/core/use-cases/create-user/create-user.use-case';
import { CreateSuperAdminUseCase } from '@/_core/modules/user/core/use-cases/create-super-admin/create-super-admin.use-case';
import { GetUserAssociationsUseCase } from '@/_core/modules/user/core/use-cases/get-user-associations/get-user-associations.use-case';
import { ProcessCSVUsersUseCase } from '@/_core/modules/user/core/use-cases/process-csv-users/process-csv-users.use-case';
import { ProcessCSVUsersWithInstitutionUseCase } from '@/_core/modules/user/core/use-cases/process-csv-users-with-institution/process-csv-users-with-institution.use-case';
import { RecordDailyAccessUseCase } from '@/_core/modules/user/core/use-cases/record-daily-access/record-daily-access.use-case';
// import { AuthenticateUserUseCase } from '@/_core/modules/user/core/use-cases/authenticate-user/authenticate-user.use-case';

/**
 * Register User module dependencies
 * @param container The DI container
 */
export function registerUserModule(container: Container): void {
  // Register repositories
  container.bind<UserRepository>(repositories.UserRepository).to(FirebaseUserRepository);
  container.bind<UserAccessHistoryRepository>(repositories.UserAccessHistoryRepository).to(FirebaseUserAccessHistoryRepository);

  // Register use cases
  container.bind(useCases.CreateUserUseCase).to(CreateUserUseCase);
  container.bind(useCases.CreateSuperAdminUseCase).to(CreateSuperAdminUseCase);
  container.bind(useCases.GetUserAssociationsUseCase).to(GetUserAssociationsUseCase);
  container.bind(useCases.ProcessCSVUsersUseCase).to(ProcessCSVUsersUseCase);
  container.bind(useCases.ProcessCSVUsersWithInstitutionUseCase).to(ProcessCSVUsersWithInstitutionUseCase);
  container.bind(useCases.RecordDailyAccessUseCase).to(RecordDailyAccessUseCase);
  // container.bind(useCases.AuthenticateUserUseCase).to(AuthenticateUserUseCase);
}
