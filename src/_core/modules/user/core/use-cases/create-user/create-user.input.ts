import { UserRole } from '../../entities/User';

/**
 * Input data for creating a user
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  type: UserRole;
}
