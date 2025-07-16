import { injectable, inject } from 'inversify';
import type { InstitutionRepository } from '../../../infrastructure/repositories/InstitutionRepository';
import { ListInstitutionsInput } from './list-institutions.input';
import { ListInstitutionsOutput } from './list-institutions.output';

/**
 * Use case for listing all institutions
 * Following Clean Architecture principles, this use case is pure and infrastructure-agnostic
 */
@injectable()
export class ListInstitutionsUseCase {
  constructor(
    @inject(Symbol.for('InstitutionRepository'))
    private readonly institutionRepository: InstitutionRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input parameters (empty for this use case)
   * @returns Promise with the list of institutions
   */
  async execute(input: ListInstitutionsInput): Promise<ListInstitutionsOutput> {
    const institutions = await this.institutionRepository.list();

    return {
      institutions
    };
  }
}
