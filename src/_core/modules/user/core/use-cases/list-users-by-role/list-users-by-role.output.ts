import type { User } from '../../entities/User';

/**
 * Output data for listing users by role
 */
export class ListUsersByRoleOutput {
  constructor(public readonly users: User[]) {}
}
