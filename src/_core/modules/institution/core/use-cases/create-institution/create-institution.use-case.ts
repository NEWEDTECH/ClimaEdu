import { injectable, inject } from 'inversify';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { Register } from '@/_core/shared/container/symbols';
import { CreateInstitutionInput } from './create-institution.input';
import { CreateInstitutionOutput } from './create-institution.output';
import { InstitutionSettings } from '../../entities/InstitutionSettings';

/**
 * Use case for creating an institution
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
   */
  async execute(input: CreateInstitutionInput): Promise<CreateInstitutionOutput> {
    // Check if institution with this domain already exists
    const existingInstitution = await this.institutionRepository.findByDomain(input.domain);
    if (existingInstitution) {
      throw new Error('Institution with this domain already exists');
    }

    // Create settings value object if provided
    let settings;
    if (input.settings) {
      settings = InstitutionSettings.create({
        logoUrl: input.settings.logoUrl,
        primaryColor: input.settings.primaryColor,
        secondaryColor: input.settings.secondaryColor
      });
    }

    // Create institution
    const institution = await this.institutionRepository.create({
      name: input.name,
      domain: input.domain,
      settings
    });

    return { institution };
  }
}
