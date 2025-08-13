import { inject, injectable } from 'inversify';
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols';
import type { SubjectRepository } from '../../../../infrastructure/repositories/SubjectRepository';
import { GetAvailableSubjectsInput } from './get-available-subjects.input';
import { GetAvailableSubjectsOutput } from './get-available-subjects.output';

/**
 * Use case for getting available subjects for tutoring
 * Following Clean Architecture principles, this use case orchestrates the business logic
 * for retrieving subjects that are available for tutoring sessions
 */
@injectable()
export class GetAvailableSubjectsUseCase {
  constructor(
    @inject(TutoringSymbols.repositories.SubjectRepository)
    private readonly subjectRepository: SubjectRepository
  ) {}

  /**
   * Executes the use case to get available subjects
   * @param input The input parameters for filtering subjects
   * @returns Promise<GetAvailableSubjectsOutput> The result containing subjects and metadata
   */
  async execute(input: GetAvailableSubjectsInput = {}): Promise<GetAvailableSubjectsOutput> {
    try {
      let subjects;

      // Apply filters based on input
      if (input.searchTerm) {
        subjects = await this.subjectRepository.search(input.searchTerm, true);
      } else if (input.category) {
        subjects = await this.subjectRepository.findByCategory(input.category, true);
      } else if (input.tutorId) {
        subjects = await this.subjectRepository.findByTutorId(input.tutorId);
      } else {
        subjects = await this.subjectRepository.findAllActive();
      }

      // Get all available categories
      const categories = await this.subjectRepository.getCategories(true);

      return {
        subjects,
        categories,
        totalCount: subjects.length
      };

    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `Failed to get available subjects: ${error.message}`
          : 'Failed to get available subjects'
      );
    }
  }
}
