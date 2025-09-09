export interface ListInstitutionAchievementsInput {
  institutionId: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  orderDirection?: 'asc' | 'desc';
}