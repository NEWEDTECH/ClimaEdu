import 'reflect-metadata';
import { Container } from 'inversify';
import { repositories as userRepositories, useCases as userUseCases } from '@/_core/shared/container/modules/user/symbols';
import { services as authServices } from '@/_core/shared/container/modules/auth/symbols';

// Import implementations
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { FirebaseAdminUserRepository } from '@/_core/modules/user/infrastructure/repositories/implementations/FirebaseAdminUserRepository';
import { CreateSuperAdminUseCase } from '@/_core/modules/user/core/use-cases/create-super-admin/create-super-admin.use-case';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { FirebaseAdminAuthService } from '@/_core/modules/auth/infrastructure/implementations/FirebaseAdminAuthService';

let apiContainer: Container | null = null;

/**
 * Setup container specifically for API routes with server-side services
 */
export function setupApiContainer(): Container {
  if (!apiContainer) {
    apiContainer = new Container({
      defaultScope: 'Singleton',
    });

    // Register repositories
    apiContainer.bind<UserRepository>(userRepositories.UserRepository).to(FirebaseAdminUserRepository);
    
    // Register services (using Admin SDK for server-side)
    apiContainer.bind<AuthService>(authServices.AuthService).to(FirebaseAdminAuthService);
    
    // Register use cases
    apiContainer.bind(userUseCases.CreateSuperAdminUseCase).to(CreateSuperAdminUseCase);
  }

  return apiContainer;
}
