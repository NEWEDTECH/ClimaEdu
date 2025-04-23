/**
 * Input data for updating institution settings
 */
export interface UpdateInstitutionSettingsInput {
  institutionId: string;
  settings: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}
