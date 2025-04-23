import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import { Register } from '@/_core/shared/container';
import { DeleteQuestionInput } from './delete-question.input';
import { DeleteQuestionOutput } from './delete-question.output';

/**
 * Use case for deleting a question from a questionnaire
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class DeleteQuestionUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireRepository)
    private questionnaireRepository: QuestionnaireRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if questionnaire or question not found
   */
  async execute(input: DeleteQuestionInput): Promise<DeleteQuestionOutput> {
    // Verify that the questionnaire exists
    const questionnaire = await this.questionnaireRepository.findById(input.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire with ID ${input.questionnaireId} not found`);
    }

    // Remove the question from the questionnaire using the entity's method
    questionnaire.removeQuestion(input.questionId);

    // Save the updated questionnaire
    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire);

    return {
      questionnaire: savedQuestionnaire,
    };
  }
}
