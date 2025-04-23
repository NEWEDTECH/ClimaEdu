import { Institution } from '../../entities/Institution';

/**
 * Output data for creating an institution
 */
export interface CreateInstitutionOutput {
  /**
   * The created institution
   */
  institution: Institution;
}
