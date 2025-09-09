import { injectable, inject } from 'inversify';
import { AchievementSymbols } from '@/_core/shared/container/modules/achievement/symbols';
import type { DefaultAchievementRepository } from '../../../infrastructure/repositories/DefaultAchievementRepository';
import type { InstitutionAchievementRepository } from '../../../infrastructure/repositories/InstitutionAchievementRepository';
import { InstitutionAchievement } from '../../entities/InstitutionAchievement';
import type { CopyDefaultAchievementInput } from './copy-default-achievement.input';
import type { CopyDefaultAchievementOutput } from './copy-default-achievement.output';

/**
 * Use case for copying a default achievement template to create an institution achievement
 * This is the ONLY operational use of DefaultAchievementRepository - for template copying
 */
@injectable()
export class CopyDefaultAchievementUseCase {
  constructor(
    @inject(AchievementSymbols.repositories.DefaultAchievementRepository)
    private defaultAchievementRepository: DefaultAchievementRepository,
    
    @inject(AchievementSymbols.repositories.InstitutionAchievementRepository)
    private institutionAchievementRepository: InstitutionAchievementRepository
  ) {}

  /**
   * Execute the copy operation
   * @param input Copy parameters
   * @returns The newly created institution achievement
   * @throws Error if template not found or copy fails
   */
  async execute(input: CopyDefaultAchievementInput): Promise<CopyDefaultAchievementOutput> {
    // Validate input
    this.validateInput(input);

    // Find the default achievement template
    const template = await this.defaultAchievementRepository.findById(input.defaultAchievementId);
    if (!template) {
      throw new Error(`Default achievement template with ID ${input.defaultAchievementId} not found`);
    }

    if (!template.isGloballyEnabled) {
      throw new Error(`Default achievement template "${template.name}" is not enabled for use`);
    }

    // Generate new ID for the institution achievement
    const institutionAchievementId = await this.institutionAchievementRepository.generateId();

    // Create institution achievement by copying from template
    const institutionAchievement = InstitutionAchievement.create({
      id: institutionAchievementId,
      institutionId: input.institutionId,
      name: input.overrides?.name || template.name,
      description: input.overrides?.description || template.description,
      iconUrl: input.overrides?.iconUrl || template.iconUrl,
      criteriaType: template.criteriaType,
      criteriaValue: input.overrides?.criteriaValue || template.criteriaValue,
      isActive: input.overrides?.isActive ?? true, // Default to active
      createdBy: input.createdBy
    });

    // Save the new institution achievement
    await this.institutionAchievementRepository.create(institutionAchievement);

    console.log(`🎯 Achievement template "${template.name}" copied to institution ${input.institutionId}`);

    return {
      achievement: institutionAchievement,
      copiedFromTemplate: true,
      originalTemplateId: input.defaultAchievementId
    };
  }

  /**
   * Validate the input parameters
   */
  private validateInput(input: CopyDefaultAchievementInput): void {
    if (!input.defaultAchievementId || input.defaultAchievementId.trim() === '') {
      throw new Error('Default achievement ID is required');
    }

    if (!input.institutionId || input.institutionId.trim() === '') {
      throw new Error('Institution ID is required');
    }

    if (!input.createdBy || input.createdBy.trim() === '') {
      throw new Error('Created by user ID is required');
    }

    // Validate overrides if provided
    if (input.overrides?.criteriaValue !== undefined && input.overrides.criteriaValue <= 0) {
      throw new Error('Criteria value must be greater than zero');
    }
  }
}