/**
 * Input for copying a default achievement template to an institution
 */
export interface CopyDefaultAchievementInput {
  /**
   * ID of the default achievement template to copy
   */
  defaultAchievementId: string;

  /**
   * ID of the institution that will receive the copied achievement
   */
  institutionId: string;

  /**
   * ID of the user performing the copy operation
   */
  createdBy: string;

  /**
   * Optional overrides for the copied achievement
   */
  overrides?: {
    name?: string;
    description?: string;
    iconUrl?: string;
    criteriaValue?: number;
    isActive?: boolean;
  };
}