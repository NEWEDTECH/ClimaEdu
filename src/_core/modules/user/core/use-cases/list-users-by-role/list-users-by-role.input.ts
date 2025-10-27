import { UserRole } from '../../entities/User';

/**
 * Input data for listing users by role
 */
export class ListUsersByRoleInput {
  constructor(public readonly role: UserRole) {}
}
