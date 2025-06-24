import { User } from '../../entities/User';

/**
 * Output data for creating a super admin user
 */
export interface CreateSuperAdminOutput {
  user: User;
}
