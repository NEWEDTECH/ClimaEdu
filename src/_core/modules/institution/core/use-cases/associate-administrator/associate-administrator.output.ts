import { UserInstitution } from '../../../core/entities/UserInstitution';

/**
 * Output data for associating an administrator to an institution
 */
export interface AssociateAdministratorOutput {
  userInstitution: UserInstitution;
}
