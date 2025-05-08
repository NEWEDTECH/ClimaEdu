import { Institution } from '../../../core/entities/Institution';

/**
 * Output data for listing institutions a user belongs to
 */
export interface ListUserInstitutionsOutput {
  institutions: Institution[];
}
