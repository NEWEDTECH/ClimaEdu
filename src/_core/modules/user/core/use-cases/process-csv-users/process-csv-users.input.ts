import { UserRole } from '../../entities/User';

export interface ProcessCSVUsersInput {
  csvData: Array<Record<string, string>>;
  institutionId: string;
  createdByUserId: string;
  createdByUserRole: UserRole;
}
