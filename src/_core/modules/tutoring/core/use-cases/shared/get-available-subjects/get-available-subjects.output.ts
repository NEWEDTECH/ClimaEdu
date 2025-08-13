import { Subject } from '../../../entities/Subject';

/**
 * Output for GetAvailableSubjectsUseCase
 */
export interface GetAvailableSubjectsOutput {
  subjects: Subject[];
  categories: string[];
  totalCount: number;
}
