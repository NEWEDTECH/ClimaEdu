import { User } from '../../entities/User';

/**
 * Output data for creating a user
 */
export interface CreateUserOutput {
  user: User;
  temporaryPassword?: string;
}
