import type { User } from '../../entities/User';

/**
 * Output data for getting a user by ID
 */
export class GetUserByIdOutput {
  constructor(public readonly user: User | null) {}
}
