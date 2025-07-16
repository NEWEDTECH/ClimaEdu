import { Institution } from '../../entities/Institution';

/**
 * Output for ListInstitutionsUseCase
 * Following Clean Architecture principles, this defines the output contract
 */
export interface ListInstitutionsOutput {
  institutions: Institution[];
}
