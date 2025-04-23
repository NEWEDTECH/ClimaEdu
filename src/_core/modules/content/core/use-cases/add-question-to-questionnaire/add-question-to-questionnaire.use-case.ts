import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import { Register } from '@/_core/shared/container';
import { AddQuestionToQuestionnaireInput } from './add-question-to-questionnaire.input';
import { AddQuestionToQuestionnaireOutput } from './add-question-to-questionnaire.output';
import { Question } from '../../entities/Question';

/**
 * Use case for adding a question to a questionnaire
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class AddQuestionToQuestionnaireUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireRepository)
    private questionnaireRepository: QuestionnaireRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if questionnaire not found or validation fails
   */
  async execute(input: AddQuestionToQuestionnaireInput): Promise<AddQuestionToQuestionnaireOutput> {
    // Verify that the questionnaire exists
    const questionnaire = await this.questionnaireRepository.findById(input.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire with ID ${input.questionnaireId} not found`);
    }

    // Generate a unique ID for the question
    // Since we don't have a QuestionRepository, we'll use a simple UUID generation approach
    const questionId = crypto.randomUUID();

    // Create the question entity
    const question = Question.create({
      id: questionId,
      questionText: input.questionText,
      options: input.options,
      correctAnswerIndex: input.correctAnswerIndex,
    });

    // Add the question to the questionnaire
    questionnaire.addQuestion(question);

    // Save the updated questionnaire
    const savedQuestionnaire = await this.questionnaireRepository.save(questionnaire);

    // Find the saved question in the questionnaire
    const savedQuestion = savedQuestionnaire.questions.find(q => q.id === questionId);
    
    if (!savedQuestion) {
      throw new Error('Failed to save question');
    }

    return {
      questionnaire: savedQuestionnaire,
      question: savedQuestion,
    };
  }
}
