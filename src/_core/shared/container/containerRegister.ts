import { container } from './container';

// Import module-specific registration functions
import { registerInstitutionModule } from './modules/institution/register';
import { registerUserModule } from './modules/user/register';
import { registerContentModule } from './modules/content/register';
import { registerAuthModule } from './modules/auth/register';
import { registerEnrollmentModule } from './modules/enrollment/register';
import { registerBadgeModule } from './modules/badge/register';
import { registerAchievementModule } from './modules/achievement/register';
import { registerChatModule } from './modules/chat/register';
import { registerPodcastModule } from './modules/podcast/register';
import { registerSocialModule } from './modules/social/register';
import { registerReportModule } from './modules/report/register';
import { registerCertificateModule } from './modules/certificate/register';
import { registerTutoringModule } from './modules/tutoring/register';
import { registerNotesModule } from './modules/notes/register';
import { registerSearchModule } from '@/_core/shared/container/modules/search/register';
import { registerSharedModule } from './modules/shared/register';

// Import initialization function
import { initializeSubscribers } from './initializeSubscribers';

/**
 * Register all dependencies in the container
 */
export function registerDependencies(): void {
  // Register shared dependencies first (EventBus, etc.)
  registerSharedModule(container);
  
  // Register module-specific dependencies
  registerInstitutionModule(container);
  registerUserModule(container);
  registerContentModule(container);
  registerAuthModule(container);
  registerEnrollmentModule(container);
  registerBadgeModule(container);
  registerAchievementModule(container);
  registerChatModule(container);
  registerPodcastModule(container);
  registerSocialModule(container);
  registerReportModule(container);
  registerCertificateModule(container);
  registerTutoringModule(container);
  registerNotesModule(container);
  registerSearchModule(container);
  
  // Initialize event subscribers after all modules are registered
  initializeSubscribers();
}
