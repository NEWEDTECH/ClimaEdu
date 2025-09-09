// Symbol registry for dependency injection

// Import module-specific symbols
import { InstitutionSymbols } from './modules/institution/symbols';
import { UserSymbols } from './modules/user/symbols';
import { ContentSymbols } from './modules/content/symbols';
import { AuthSymbols } from './modules/auth/symbols';
import { EnrollmentSymbols } from './modules/enrollment/symbols';
import { BadgeSymbols } from './modules/badge/symbols';
import { AchievementSymbols } from './modules/achievement/symbols';
import { ChatSymbols } from './modules/chat/symbols';
import { PodcastSymbols } from './modules/podcast/symbols';
import { SocialSymbols } from './modules/social/symbols';
import { ReportSymbols } from './modules/report/symbols';
import { CertificateSymbols } from './modules/certificate/symbols';
import { TutoringSymbols } from './modules/tutoring/symbols';

// Re-export module-specific symbols
export { InstitutionSymbols, UserSymbols, ContentSymbols, AuthSymbols, EnrollmentSymbols, BadgeSymbols, AchievementSymbols, ChatSymbols, PodcastSymbols, SocialSymbols, ReportSymbols, CertificateSymbols, TutoringSymbols };

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
  achievement: {
    repository: AchievementSymbols.repositories,
    useCase: AchievementSymbols.useCases,
  },
  chat: {
    repository: ChatSymbols.repositories,
    useCase: ChatSymbols.useCases,
  },
  podcast: {
    repository: PodcastSymbols.repositories,
    useCase: PodcastSymbols.useCases,
  },
  social: {
    repository: SocialSymbols.repositories,
    useCase: SocialSymbols.useCases,
  },
  report: {
    repository: ReportSymbols.repositories,
    useCase: ReportSymbols.useCases,
  },
  certificate: {
    repository: CertificateSymbols.repositories,
    useCase: CertificateSymbols.useCases,
  },
  tutoring: {
    repository: TutoringSymbols.repositories,
    useCase: TutoringSymbols.useCases,
  },
};
