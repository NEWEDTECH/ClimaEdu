import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { ListUsersByRoleInput } from './list-users-by-role.input';
import { ListUsersByRoleOutput } from './list-users-by-role.output';

/**
 * Use case for listing users by role
 * Following Clean Architecture principles, this use case is pure and infrastructure-agnostic
 */
@injectable()
export class ListUsersByRoleUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input parameters with role
   * @returns Promise with the list of users
   */
  async execute(input: ListUsersByRoleInput): Promise<ListUsersByRoleOutput> {
    const users = await this.userRepository.listByType(input.role);
    return new ListUsersByRoleOutput(users);
  }
}
