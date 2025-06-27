// Symbol registry for dependency injection

// Import module-specific symbols
import { InstitutionSymbols } from './modules/institution/symbols';
import { UserSymbols } from './modules/user/symbols';
import { ContentSymbols } from './modules/content/symbols';
import { AuthSymbols } from './modules/auth/symbols';
import { EnrollmentSymbols } from './modules/enrollment/symbols';
import { BadgeSymbols } from './modules/badge/symbols';
import { ChatSymbols } from './modules/chat/symbols';
import { PodcastSymbols } from './modules/podcast/symbols';

// Re-export module-specific symbols
export { InstitutionSymbols, UserSymbols, ContentSymbols, AuthSymbols, EnrollmentSymbols, BadgeSymbols, ChatSymbols, PodcastSymbols };

// Register object to simplify imports
export const Register = {
  user: {
    repository: UserSymbols.repositories,
    useCase: UserSymbols.useCases,
  },
  content: {
    repository: ContentSymbols.repositories,
    useCase: ContentSymbols.useCases,
  },
  auth: {
    service: AuthSymbols.services,
    useCase: AuthSymbols.useCases,
  },
  institution: {
    repository: InstitutionSymbols.repositories,
    useCase: InstitutionSymbols.useCases,
  },
  enrollment: {
    repository: EnrollmentSymbols.repositories,
    useCase: EnrollmentSymbols.useCases,
  },
  badge: {
    repository: BadgeSymbols.repositories,
    useCase: BadgeSymbols.useCases,
  },
  chat: {
    repository: ChatSymbols.repositories,
    useCase: ChatSymbols.useCases,
  },
  podcast: {
    repository: PodcastSymbols.repositories,
    useCase: PodcastSymbols.useCases,
  },
};
