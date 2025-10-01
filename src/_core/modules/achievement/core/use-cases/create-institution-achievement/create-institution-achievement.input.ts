import { BadgeCriteriaType } from '@/_core/modules/badge/core/entities/BadgeCriteriaType';

export interface CreateInstitutionAchievementInput {
  institutionId: string;
  name: string;
  description: string;
  iconUrl: string;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number;
  createdBy: string;
  isActive?: boolean;
}