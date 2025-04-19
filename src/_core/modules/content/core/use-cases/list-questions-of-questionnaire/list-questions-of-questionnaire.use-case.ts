import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import { Register } from '@/_core/shared/container';
import { ListQuestionsOfQuestionnaireInput } from './list-questions-of-questionnaire.input';
import { ListQuestionsOfQuestionnaireOutput } from './list-questions-of-questionnaire.output';

/**
 * Use case for listing questions of a questionnaire
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class ListQuestionsOfQuestionnaireUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireRepository)
    private questionnaireRepository: QuestionnaireRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if questionnaire not found
   */
  async execute(input: ListQuestionsOfQuestionnaireInput): Promise<ListQuestionsOfQuestionnaireOutput> {
    // Verify that the questionnaire exists
    const questionnaire = await this.questionnaireRepository.findById(input.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire with ID ${input.questionnaireId} not found`);
    }

    // Return the questions using the entity's method and the questionnaire
    return {
      questions: questionnaire.listQuestions(),
      questionnaire,
    };
  }
}
