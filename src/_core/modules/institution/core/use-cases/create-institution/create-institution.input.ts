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
}
