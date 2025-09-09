import { injectable, inject } from 'inversify';
import { AchievementSymbols } from '@/_core/shared/container/modules/achievement/symbols';
import type { DefaultAchievementRepository } from '../../../infrastructure/repositories/DefaultAchievementRepository';
import type { ListDefaultAchievementTemplatesInput } from './list-default-achievement-templates.input';
import type { ListDefaultAchievementTemplatesOutput } from './list-default-achievement-templates.output';

/**
 * Use case for listing default achievement templates available for copying
 * This provides templates for the administrative interface
 */
@injectable()
export class ListDefaultAchievementTemplatesUseCase {
  constructor(
    @inject(AchievementSymbols.repositories.DefaultAchievementRepository)
    private defaultAchievementRepository: DefaultAchievementRepository
  ) {}

  /**
   * Execute the listing operation
   * @param input Filtering and pagination parameters
   * @returns Available templates and metadata
   */
  async execute(input: ListDefaultAchievementTemplatesInput = {}): Promise<ListDefaultAchievementTemplatesOutput> {
    // Default to only enabled templates
    const onlyEnabled = input.onlyEnabled !== false;

    // Get templates based on filters
    let templates;
    
    if (input.category) {
      templates = await this.defaultAchievementRepository.listByCategory(input.category, onlyEnabled);
    } else if (input.criteriaType) {
      templates = await this.defaultAchievementRepository.findByCriteriaType(input.criteriaType, onlyEnabled);
    } else {
      templates = await this.defaultAchievementRepository.findAll({ 
        isActive: onlyEnabled 
      });
    }

    // Apply pagination if specified
    let paginatedTemplates = templates;
    if (input.offset && input.offset > 0) {
      paginatedTemplates = templates.slice(input.offset);
    }
    if (input.limit && input.limit > 0) {
      paginatedTemplates = paginatedTemplates.slice(0, input.limit);
    }

    // Extract available categories
    const availableCategories = [...new Set(templates.map(template => template.category))].sort();

    return {
      templates: paginatedTemplates,
      total: templates.length,
      availableCategories
    };
  }
}