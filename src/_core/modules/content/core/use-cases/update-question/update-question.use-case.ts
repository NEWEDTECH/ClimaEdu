import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import { Register } from '@/_core/shared/container';
import { UpdateQuestionInput } from './update-question.input';
import { UpdateQuestionOutput } from './update-question.output';

/**
 * Use case for updating a question in a questionnaire
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class UpdateQuestionUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireRepository)
    private questionnaireRepository: QuestionnaireRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if questionnaire or question not found, or validation fails
   */
  async execute(input: UpdateQuestionInput): Promise<UpdateQuestionOutput> {
    // Verify that the questionnaire exists
    const questionnaire = await this.questionnaireRepository.findById(input.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire with ID ${input.questionnaireId} not found`);
    }

    // Find the question in the questionnaire using the entity's method
    const question = questionnaire.findQuestionById(input.questionId);

    // Update the question fields if provided
    if (input.questionText !== undefined) {
      question.updateQuestionText(input.questionText);
    }

    if (input.options !== undefined) {
      question.updateOptions(input.options);
    }

    if (input.correctAnswerIndex !== undefined) {
      question.updateCorrectAnswer(input.correctAnswerIndex);
    }

    // Save the updated questionnaire
    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire);

    // Find the updated question in the saved questionnaire
    const updatedQuestion = savedQuestionnaire.questions.find(q => q.id === input.questionId);
    
    if (!updatedQuestion) {
      throw new Error('Failed to update question');
    }

    return {
      questionnaire: savedQuestionnaire,
      question: updatedQuestion,
    };
  }
}
