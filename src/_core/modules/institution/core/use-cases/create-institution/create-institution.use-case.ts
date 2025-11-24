import { injectable, inject } from 'inversify';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { Register } from '@/_core/shared/container';
import { CreateInstitutionInput } from './create-institution.input';
import { CreateInstitutionOutput } from './create-institution.output';
import { Institution } from '../../entities/Institution';
import { InstitutionSettings } from '../../entities/InstitutionSettings';

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
    
    // Create settings if any of the settings fields are provided
    const settings = input.logoUrl || input.coverImageUrl || input.primaryColor || input.secondaryColor
      ? InstitutionSettings.create({
          logoUrl: input.logoUrl,
          coverImageUrl: input.coverImageUrl,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
        })
      : undefined;
    
    const institution = Institution.create({
      id,
      name: input.name,
      domain: input.domain,
      settings,
    });

    // Save the institution
    const savedInstitution = await this.institutionRepository.save(institution);

    return { institution: savedInstitution };
  }
}
