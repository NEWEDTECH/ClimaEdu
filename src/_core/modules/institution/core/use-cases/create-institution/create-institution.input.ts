/**
 * Input data for creating an institution
 */
export interface CreateInstitutionInput {
  name: string;
  domain: string;
  settings?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}
