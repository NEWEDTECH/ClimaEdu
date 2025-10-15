import { UserWithPassword } from '../process-csv-users/process-csv-users.use-case';

export interface ProcessCSVUsersWithInstitutionOutput {
  createdUsers: UserWithPassword[];
  failedEmails: Array<{
    email: string;
    error: string;
  }>;
  totalProcessed: number;
  totalCreated: number;
  totalFailed: number;
}
