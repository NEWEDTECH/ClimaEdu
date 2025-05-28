import { UserRole } from '@/_core/modules/user/core/entities/User';

/**
 * Input data for associating a user to an institution
 */
export interface AssociateUserToInstitutionInput {
  userId: string;
  institutionId: string;
  userRole: UserRole;
}
