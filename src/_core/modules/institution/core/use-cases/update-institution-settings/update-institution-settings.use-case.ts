import { injectable, inject } from 'inversify';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { Register } from '@/_core/shared/container';
import { UpdateInstitutionSettingsInput } from './update-institution-settings.input';
import { UpdateInstitutionSettingsOutput } from './update-institution-settings.output';
import { InstitutionSettings } from '../../entities/InstitutionSettings';

/**
 * Use case for updating institution settings
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdateInstitutionSettingsUseCase {
  constructor(
    @inject(Register.institution.repository.InstitutionRepository)
    private institutionRepository: InstitutionRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if institution not found
   */
  async execute(input: UpdateInstitutionSettingsInput): Promise<UpdateInstitutionSettingsOutput> {
    // Find the institution by ID
    const institution = await this.institutionRepository.findById(input.institutionId);
    if (!institution) {
      throw new Error(`Institution with ID ${input.institutionId} not found`);
    }

    // Create new settings object with updated values
    const currentSettings = institution.settings;
    const newSettings = InstitutionSettings.create({
      logoUrl: input.settings.logoUrl ?? currentSettings.logoUrl,
      coverImageUrl: input.settings.coverImageUrl ?? currentSettings.coverImageUrl,
      primaryColor: input.settings.primaryColor ?? currentSettings.primaryColor,
      secondaryColor: input.settings.secondaryColor ?? currentSettings.secondaryColor
    });

    // Update the institution with new settings using entity method
    institution.updateSettings(newSettings);

    // Save the updated institution
    const updatedInstitution = await this.institutionRepository.save(institution);

    return { institution: updatedInstitution };
  }
}
