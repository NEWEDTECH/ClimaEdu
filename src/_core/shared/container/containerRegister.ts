import { container } from './container';

// Import module-specific registration functions
import { registerInstitutionModule } from './modules/institution/register';
import { registerUserModule } from './modules/user/register';
import { registerContentModule } from './modules/content/register';
import { registerAuthModule } from './modules/auth/register';
import { registerEnrollmentModule } from './modules/enrollment/register';
import { registerBadgeModule } from './modules/badge/register';
import { registerChatModule } from './modules/chat/register';
import { registerSocialModule } from './modules/social/register';

/**
 * Register all dependencies in the container
 */
export function registerDependencies(): void {
  // Register module-specific dependencies
  registerInstitutionModule(container);
  registerUserModule(container);
  registerContentModule(container);
  registerAuthModule(container);
  registerEnrollmentModule(container);
  registerBadgeModule(container);
  registerChatModule(container);
  registerSocialModule(container);
}
