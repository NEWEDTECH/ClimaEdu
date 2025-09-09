import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

export interface UpdateInstitutionAchievementInput {
  achievementId: string;
  institutionId: string;
  name?: string;
  description?: string;
  criteriaType?: BadgeCriteriaType;
  criteriaValue?: number;
  iconUrl?: string;
  isActive?: boolean;
}