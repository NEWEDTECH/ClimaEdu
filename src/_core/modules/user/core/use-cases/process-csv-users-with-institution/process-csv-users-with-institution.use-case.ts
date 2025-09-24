import { injectable, inject } from 'inversify';
import { Register } from '@/_core/shared/container';
import { ProcessCSVUsersWithInstitutionInput } from './process-csv-users-with-institution.input';
import { ProcessCSVUsersWithInstitutionOutput } from './process-csv-users-with-institution.output';
import { ProcessCSVUsersUseCase } from '../process-csv-users/process-csv-users.use-case';
import { AssociateUserToInstitutionUseCase } from '@/_core/modules/institution/core/use-cases/associate-user-to-institution/associate-user-to-institution.use-case';

/**
 * Use case for processing CSV data, creating multiple users, and associating them to an institution
 * Following Clean Architecture principles, this use case orchestrates other use cases
 */
@injectable()
export class ProcessCSVUsersWithInstitutionUseCase {
  constructor(
    @inject(Register.user.useCase.ProcessCSVUsersUseCase)
    private processCSVUsersUseCase: ProcessCSVUsersUseCase,
    
    @inject(Register.institution.useCase.AssociateUserToInstitutionUseCase)
    private associateUserToInstitutionUseCase: AssociateUserToInstitutionUseCase
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ProcessCSVUsersWithInstitutionInput): Promise<ProcessCSVUsersWithInstitutionOutput> {
    const { csvData, institutionId, createdByUserId, createdByUserRole } = input;

    // First, process the CSV and create users
    const processResult = await this.processCSVUsersUseCase.execute({
      csvData,
      institutionId,
      createdByUserId,
      createdByUserRole
    });

    // Then, associate each successfully created user to the institution
    const associationFailures: Array<{ email: string; error: string }> = [];
    
    for (const user of processResult.createdUsers) {
      try {
        await this.associateUserToInstitutionUseCase.execute({
          userId: user.id,
          institutionId,
          userRole: user.role
        });
      } catch (error) {
        associationFailures.push({
          email: user.email.value,
          error: `Failed to associate user to institution: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    // Combine failures from user creation and institution association
    const allFailures = [
      ...processResult.failedEmails,
      ...associationFailures
    ];

    return {
      createdUsers: processResult.createdUsers,
      failedEmails: allFailures,
      totalProcessed: processResult.totalProcessed,
      totalCreated: processResult.totalCreated,
      totalFailed: allFailures.length
    };
  }
}
