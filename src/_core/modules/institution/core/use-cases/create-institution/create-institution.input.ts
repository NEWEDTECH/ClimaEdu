/**
 * Input data for creating an institution
 */
export interface CreateInstitutionInput {
  /**
   * The name of the institution
   */
  name: string;

  /**
   * The domain of the institution (e.g., example.com)
   */
  domain: string;

  /**
   * Optional logo URL for the institution
   */
  logoUrl?: string;

  /**
   * Optional primary color for the institution's branding
   */
  primaryColor?: string;

  /**
   * Optional secondary color for the institution's branding
   */
  secondaryColor?: string;
}
