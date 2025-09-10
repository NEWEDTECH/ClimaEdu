import type { InstitutionAchievement } from '../../entities/InstitutionAchievement';

/**
 * Output from copying a default achievement template
 */
export interface CopyDefaultAchievementOutput {
  /**
   * The newly created institution achievement
   */
  achievement: InstitutionAchievement;

  /**
   * Whether this was copied from a default template
   */
  copiedFromTemplate: true;

  /**
   * ID of the original default achievement template
   */
  originalTemplateId: string;
}