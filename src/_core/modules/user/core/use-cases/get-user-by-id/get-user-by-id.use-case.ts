import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { GetUserByIdInput } from './get-user-by-id.input';
import { GetUserByIdOutput } from './get-user-by-id.output';

/**
 * Use case for getting a user by ID
 * Following Clean Architecture principles, this use case is pure and infrastructure-agnostic
 */
@injectable()
export class GetUserByIdUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input parameters with userId
   * @returns Promise with the user or null if not found
   */
  async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const user = await this.userRepository.findById(input.userId);
    return new GetUserByIdOutput(user);
  }
}
