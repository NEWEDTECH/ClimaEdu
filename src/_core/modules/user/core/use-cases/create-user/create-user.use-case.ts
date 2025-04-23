import { injectable, inject } from 'inversify';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { Register } from '@/_core/shared/container';
import { CreateUserInput } from './create-user.input';
import { CreateUserOutput } from './create-user.output';
import { Email } from '../../entities/Email';
import { User } from '../../entities/User';

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

    // Generate a new ID
    const id = await this.userRepository.generateId();
    
    // Create email value object
    const email = Email.create(input.email);

    // Create user entity
    const user = User.create({
      id,
      name: input.name,
      email: email,
      role: input.type,
      institutionId: input.institutionId || 'default-institution', // Provide a default or require it in the input
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    return { user: savedUser };
  }
}
