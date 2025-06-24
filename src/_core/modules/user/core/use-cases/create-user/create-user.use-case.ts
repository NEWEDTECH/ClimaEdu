import { injectable, inject } from 'inversify';
import { nanoid } from 'nanoid';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
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
    private userRepository: UserRepository,
    
    @inject(Register.auth.service.AuthService)
    private authService: AuthService
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

    // Create user in Firebase Authentication
    const authUserId = await this.authService.createUserWithEmailAndPassword(
      input.email,
      input.password || nanoid(8)
    );
    
    // Use the Firebase Auth ID as the user ID
    const id = authUserId;
    
    // Create email value object
    const email = Email.create(input.email);

    // Create user entity
    const user = User.create({
      id,
      name: input.name,
      email: email,
      role: input.type
    });

    // Save user to Firestore
    const savedUser = await this.userRepository.save(user);

    return { user: savedUser };
  }
}
