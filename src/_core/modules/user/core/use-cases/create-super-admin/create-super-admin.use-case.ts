import { injectable, inject } from 'inversify';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { Register } from '@/_core/shared/container';
import { CreateSuperAdminInput } from './create-super-admin.input';
import { CreateSuperAdminOutput } from './create-super-admin.output';
import { Email } from '../../entities/Email';
import { User, UserRole } from '../../entities/User';

/**
 * Use case for creating a super admin user
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreateSuperAdminUseCase {
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
   * @throws Error if validation fails or super admin already exists
   */
  async execute(input: CreateSuperAdminInput): Promise<CreateSuperAdminOutput> {
    // Check if a SUPER_ADMIN already exists
    const existingSuperAdmins = await this.userRepository.listByType(UserRole.SUPER_ADMIN);
    if (existingSuperAdmins.length > 0) {
      throw new Error('A SUPER_ADMIN user already exists in the system');
    }

    // Check if user with this email already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user in Firebase Authentication
    const authUserId = await this.authService.createUserWithEmailAndPassword(
      input.email,
      input.password
    );
    
    // Use the Firebase Auth ID as the user ID
    const id = authUserId;
    
    // Create email value object
    const email = Email.create(input.email);

    // Create user entity with SUPER_ADMIN role
    const user = User.create({
      id,
      name: input.name,
      email: email,
      role: UserRole.SUPER_ADMIN
    });

    // Save user to Firestore
    const savedUser = await this.userRepository.save(user);

    return { user: savedUser };
  }
}
