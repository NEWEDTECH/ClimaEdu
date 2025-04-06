import { container } from './container';
import { Register } from './symbols';

// Import repositories and use cases

// New imports (English naming)
import type { UserRepository } from '@/modules/user/infrastructure/repositories/UserRepository';
import { FirebaseUserRepository } from '@/modules/user/infrastructure/repositories/implementations/FirebaseUserRepository';
import { CreateUserUseCase } from '@/modules/user/core/use-cases/create-user/create-user.use-case';
// import { AuthenticateUserUseCase } from '@/modules/user/core/use-cases/authenticate-user/authenticate-user.use-case';

import type { ContentRepository } from '@/modules/content/infrastructure/repositories/ContentRepository';
import { FirebaseContentRepository } from '@/modules/content/infrastructure/repositories/implementations/FirebaseContentRepository';
import { CreateContentUseCase } from '@/modules/content/core/use-cases/create-content/create-content.use-case';
// import { ListContentsUseCase } from '@/modules/content/core/use-cases/list-contents/list-contents.use-case';

export function registerDependencies() {
  // Register new modules (English naming)
  container.bind<UserRepository>(Register.user.repository.UserRepository).to(FirebaseUserRepository);
  container.bind(Register.user.useCase.CreateUserUseCase).to(CreateUserUseCase);
  // container.bind(Register.user.useCase.AuthenticateUserUseCase).to(AuthenticateUserUseCase);

  container.bind<ContentRepository>(Register.content.repository.ContentRepository).to(FirebaseContentRepository);
  container.bind(Register.content.useCase.CreateContentUseCase).to(CreateContentUseCase);
  // container.bind(Register.content.useCase.ListContentsUseCase).to(ListContentsUseCase);
}
