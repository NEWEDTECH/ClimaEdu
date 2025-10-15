import { UserWithPassword } from './process-csv-users.use-case';

export interface ProcessCSVUsersOutput {
  createdUsers: UserWithPassword[];
  failedEmails: Array<{
    email: string;
    error: string;
  }>;
  totalProcessed: number;
  totalCreated: number;
  totalFailed: number;
}
