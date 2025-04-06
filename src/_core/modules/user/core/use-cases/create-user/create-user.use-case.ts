import { injectable, inject } from 'inversify';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { Register } from '@/_core/shared/container/symbols';
import { CreateUserInput } from './create-user.input';
import { CreateUserOutput } from './create-user.output';

/**
 * Use case for creating a user
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private userRepository: UserRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      type: input.type,
    });

    return { user };
  }
}
