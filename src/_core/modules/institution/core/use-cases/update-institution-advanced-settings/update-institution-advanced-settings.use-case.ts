import { injectable, inject } from 'inversify';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import type { UpdateInstitutionAdvancedSettingsInput } from './update-institution-advanced-settings.input';
import type { UpdateInstitutionAdvancedSettingsOutput } from './update-institution-advanced-settings.output';
import { Register } from '@/_core/shared/container';

@injectable()
export class UpdateInstitutionAdvancedSettingsUseCase {
  constructor(
    @inject(Register.institution.repository.InstitutionRepository)
    private institutionRepository: InstitutionRepository
  ) {}

  async execute(input: UpdateInstitutionAdvancedSettingsInput): Promise<UpdateInstitutionAdvancedSettingsOutput> {
    this.validateInput(input);

    const institution = await this.institutionRepository.findById(input.institutionId);
    
    if (!institution) {
      throw new Error(`Institution with ID ${input.institutionId} not found`);
    }

    const updatedSettings = institution.settings.updateAdvancedSettings(input.advancedSettings);
    institution.updateSettings(updatedSettings);

    const savedInstitution = await this.institutionRepository.save(institution);

    return {
      institution: savedInstitution,
    };
  }

  private validateInput(input: UpdateInstitutionAdvancedSettingsInput): void {
    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }

    if (!input.advancedSettings) {
      throw new Error('Advanced settings are required');
    }

    if (input.advancedSettings.riskLevels) {
      const { high, medium } = input.advancedSettings.riskLevels;
      if (high !== undefined && medium !== undefined && high >= medium) {
        throw new Error('High risk threshold must be lower than medium risk threshold');
      }
      if (high !== undefined && (high < 0 || high > 100)) {
        throw new Error('High risk threshold must be between 0 and 100');
      }
      if (medium !== undefined && (medium < 0 || medium > 100)) {
        throw new Error('Medium risk threshold must be between 0 and 100');
      }
    }

    if (input.advancedSettings.participationLevels) {
      const { high, medium } = input.advancedSettings.participationLevels;
      if (high !== undefined && medium !== undefined && high <= medium) {
        throw new Error('High participation threshold must be higher than medium participation threshold');
      }
      if (high !== undefined && high < 0) {
        throw new Error('High participation threshold must be positive');
      }
      if (medium !== undefined && medium < 0) {
        throw new Error('Medium participation threshold must be positive');
      }
    }

    if (input.advancedSettings.performanceRatings) {
      const { excellent, good, average, belowAverage } = input.advancedSettings.performanceRatings;
      
      const ratings = [
        { name: 'excellent', value: excellent },
        { name: 'good', value: good },
        { name: 'average', value: average },
        { name: 'belowAverage', value: belowAverage }
      ].filter(r => r.value !== undefined);

      for (const rating of ratings) {
        if (rating.value! < 0 || rating.value! > 100) {
          throw new Error(`${rating.name} performance rating must be between 0 and 100`);
        }
      }

      if (excellent !== undefined && good !== undefined && excellent <= good) {
        throw new Error('Excellent rating threshold must be higher than good rating threshold');
      }
      if (good !== undefined && average !== undefined && good <= average) {
        throw new Error('Good rating threshold must be higher than average rating threshold');
      }
      if (average !== undefined && belowAverage !== undefined && average <= belowAverage) {
        throw new Error('Average rating threshold must be higher than below average rating threshold');
      }
    }

    if (input.advancedSettings.inactivityThreshold !== undefined) {
      if (input.advancedSettings.inactivityThreshold < 1 || input.advancedSettings.inactivityThreshold > 365) {
        throw new Error('Inactivity threshold must be between 1 and 365 days');
      }
    }

    if (input.advancedSettings.profileCompleteness !== undefined) {
      if (input.advancedSettings.profileCompleteness < 0 || input.advancedSettings.profileCompleteness > 100) {
        throw new Error('Profile completeness threshold must be between 0 and 100');
      }
    }
  }
}