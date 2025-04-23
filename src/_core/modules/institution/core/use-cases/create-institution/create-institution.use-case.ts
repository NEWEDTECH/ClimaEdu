import { injectable, inject } from 'inversify';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { Register } from '@/_core/shared/container';
import { CreateInstitutionInput } from './create-institution.input';
import { CreateInstitutionOutput } from './create-institution.output';
import { Institution } from '../../entities/Institution';

/**
 * Use case for creating an institution with basic settings
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class CreateInstitutionUseCase {
  constructor(
    @inject(Register.institution.repository.InstitutionRepository)
    private institutionRepository: InstitutionRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if validation fails
   */
  async execute(input: CreateInstitutionInput): Promise<CreateInstitutionOutput> {
    // Check if an institution with the same domain already exists
    const existingInstitution = await this.institutionRepository.findByDomain(input.domain);
    if (existingInstitution) {
      throw new Error(`Institution with domain ${input.domain} already exists`);
    }

    // Generate ID and create institution entity
    const id = await this.institutionRepository.generateId();
    const institution = Institution.create({
      id,
      name: input.name,
      domain: input.domain,
    });

    // Save the institution
    const savedInstitution = await this.institutionRepository.save(institution);

    return { institution: savedInstitution };
  }
}
