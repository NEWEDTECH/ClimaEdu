import { container } from './container';
import { Register } from './symbols';

// Import repositories and use cases

// Institution module imports
// import type { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
// import { FirebaseInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/implementations/FirebaseInstitutionRepository';
import { CreateInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/create-institution/create-institution.use-case';
import { UpdateInstitutionSettingsUseCase } from '@/_core/modules/institution/core/use-cases/update-institution-settings/update-institution-settings.use-case';

// User module imports
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { FirebaseUserRepository } from '@/_core/modules/user/infrastructure/repositories/implementations/FirebaseUserRepository';
import { CreateUserUseCase } from '@/_core/modules/user/core/use-cases/create-user/create-user.use-case';
// import { AuthenticateUserUseCase } from '@/modules/user/core/use-cases/authenticate-user/authenticate-user.use-case';

// Content module imports
import type { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository';
import { FirebaseContentRepository } from '@/_core/modules/content/infrastructure/repositories/implementations/FirebaseContentRepository';
import { CreateContentUseCase } from '@/_core/modules/content/core/use-cases/create-content/create-content.use-case';
// import { ListContentsUseCase } from '@/modules/content/core/use-cases/list-contents/list-contents.use-case';

// Auth module imports
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { FirebaseAuthService } from '@/_core/modules/auth/infrastructure/implementations/FirebaseAuthService';
import { SendSignInLinkUseCase } from '@/_core/modules/auth/core/use-cases/send-sign-in-link/send-sign-in-link.use-case';
import { SignInWithEmailLinkUseCase } from '@/_core/modules/auth/core/use-cases/sign-in-with-email-link/sign-in-with-email-link.use-case';

export function registerDependencies() {
  // Register Institution module dependencies
  // container.bind<InstitutionRepository>(Register.institution.repository.InstitutionRepository).to(FirebaseInstitutionRepository);
  container.bind(Register.institution.useCase.CreateInstitutionUseCase).to(CreateInstitutionUseCase);
  container.bind(Register.institution.useCase.UpdateInstitutionSettingsUseCase).to(UpdateInstitutionSettingsUseCase);

  // Register User module dependencies
  container.bind<UserRepository>(Register.user.repository.UserRepository).to(FirebaseUserRepository);
  container.bind(Register.user.useCase.CreateUserUseCase).to(CreateUserUseCase);
  // container.bind(Register.user.useCase.AuthenticateUserUseCase).to(AuthenticateUserUseCase);

  // Register Content module dependencies
  container.bind<ContentRepository>(Register.content.repository.ContentRepository).to(FirebaseContentRepository);
  container.bind(Register.content.useCase.CreateContentUseCase).to(CreateContentUseCase);
  // container.bind(Register.content.useCase.ListContentsUseCase).to(ListContentsUseCase);

  // Register Auth module dependencies
  container.bind<AuthService>(Register.auth.service.AuthService).to(FirebaseAuthService);
  container.bind(Register.auth.useCase.SendSignInLinkUseCase).to(SendSignInLinkUseCase);
  container.bind(Register.auth.useCase.SignInWithEmailLinkUseCase).to(SignInWithEmailLinkUseCase);
}
