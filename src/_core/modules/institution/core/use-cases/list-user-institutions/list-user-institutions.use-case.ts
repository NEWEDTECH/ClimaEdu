import { injectable, inject } from 'inversify';
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import type { UserInstitutionRepository } from '../../../infrastructure/repositories/UserInstitutionRepository';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { Register } from '@/_core/shared/container';
import { ListUserInstitutionsInput } from './list-user-institutions.input';
import { ListUserInstitutionsOutput } from './list-user-institutions.output';
import { Institution } from '../../../core/entities/Institution';

/**
 * Use case for listing institutions a user belongs to
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class ListUserInstitutionsUseCase {
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
   * @throws Error if user not found
   */
  async execute(input: ListUserInstitutionsInput): Promise<ListUserInstitutionsOutput> {
    // Verify if the user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find all user-institution associations for this user
    const userInstitutions = await this.userInstitutionRepository.findByUserId(input.userId);
    
    // If no associations found, return empty array
    if (userInstitutions.length === 0) {
      return { institutions: [] };
    }

    // Get institution IDs from associations
    const institutionIds = userInstitutions.map(ui => ui.institutionId);
    
    // Fetch all institutions
    const institutions: Institution[] = [];
    
    // For each institution ID, fetch the institution details
    for (const institutionId of institutionIds) {
      const institution = await this.institutionRepository.findById(institutionId);
      if (institution) {
        institutions.push(institution);
      }
    }

    return { institutions };
  }
}
