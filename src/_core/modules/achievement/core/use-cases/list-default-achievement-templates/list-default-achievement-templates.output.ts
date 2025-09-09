import type { DefaultAchievement } from '../../entities/DefaultAchievement';

/**
 * Output from listing default achievement templates
 */
export interface ListDefaultAchievementTemplatesOutput {
  /**
   * Available template achievements
   */
  templates: DefaultAchievement[];

  /**
   * Total number of available templates (useful for pagination)
   */
  total: number;

  /**
   * Categories available in the templates
   */
  availableCategories: string[];
}