import { User } from '../../entities/User';

export interface ProcessCSVUsersOutput {
  createdUsers: User[];
  failedEmails: Array<{
    email: string;
    error: string;
  }>;
  totalProcessed: number;
  totalCreated: number;
  totalFailed: number;
}
