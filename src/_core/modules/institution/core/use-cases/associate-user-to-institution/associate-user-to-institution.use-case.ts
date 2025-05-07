import { injectable, inject } from 'inversify';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import type { UserInstitutionRepository } from '../../../infrastructure/repositories/UserInstitutionRepository';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { Register } from '@/_core/shared/container';
import { AssociateUserToInstitutionInput } from './associate-user-to-institution.input';
import { AssociateUserToInstitutionOutput } from './associate-user-to-institution.output';
import { UserInstitution } from '../../../core/entities/UserInstitution';

/**
 * Use case for associating a user to an institution
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class AssociateUserToInstitutionUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private userRepository: UserRepository,
    
    @inject(Register.institution.repository.UserInstitutionRepository)
    private userInstitutionRepository: UserInstitutionRepository,
    
    @inject(Register.institution.repository.InstitutionRepository)
    private institutionRepository: InstitutionRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if validation fails
   */
  async execute(input: AssociateUserToInstitutionInput): Promise<AssociateUserToInstitutionOutput> {
    // Verify if the user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify if the institution exists
    const institution = await this.institutionRepository.findById(input.institutionId);
    if (!institution) {
      throw new Error('Institution not found');
    }

    // Check if the association already exists
    const existingAssociation = await this.userInstitutionRepository.findByUserAndInstitution(
      input.userId,
      input.institutionId
    );
    
    if (existingAssociation) {
      return { userInstitution: existingAssociation };
    }

    // Create a new association
    const id = await this.userInstitutionRepository.generateId();
    const userInstitution = UserInstitution.create({
      id,
      userId: input.userId,
      institutionId: input.institutionId
    });

    // Save the association
    const savedUserInstitution = await this.userInstitutionRepository.save(userInstitution);

    return { userInstitution: savedUserInstitution };
  }
}
