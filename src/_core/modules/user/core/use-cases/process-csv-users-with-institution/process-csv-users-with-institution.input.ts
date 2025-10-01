import { UserRole } from '../../entities/User';

export interface ProcessCSVUsersWithInstitutionInput {
  csvData: Array<Record<string, string>>;
  institutionId: string;
  createdByUserId: string;
  createdByUserRole: UserRole;
}
