import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import type { QuestionnaireSubmissionRepository } from '../../../infrastructure/repositories/QuestionnaireSubmissionRepository';
import { Register } from '@/_core/shared/container';
import { RetryQuestionnaireInput } from './retry-questionnaire.input';
import { RetryQuestionnaireOutput } from './retry-questionnaire.output';

/**
 * Use case for checking if a user can retry a questionnaire
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class RetryQuestionnaireUseCase {
  constructor(
    @inject(Register.content.repository.QuestionnaireRepository)
    private questionnaireRepository: QuestionnaireRepository,
    
    @inject(Register.content.repository.QuestionnaireSubmissionRepository)
    private questionnaireSubmissionRepository: QuestionnaireSubmissionRepository
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   * @throws Error if questionnaire not found
   */
  async execute(input: RetryQuestionnaireInput): Promise<RetryQuestionnaireOutput> {
    // Verify that the questionnaire exists
    const questionnaire = await this.questionnaireRepository.findById(input.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire with ID ${input.questionnaireId} not found`);
    }

    // Count the number of attempts for this questionnaire by this user
    const attemptsCount = await this.questionnaireSubmissionRepository.countAttempts(
      input.questionnaireId,
      input.userId
    );

    // Calculate the number of attempts remaining
    const attemptsRemaining = Math.max(0, questionnaire.maxAttempts - attemptsCount);

    // Determine if the user can retry the questionnaire
    const canRetry = attemptsRemaining > 0;

    return {
      canRetry,
      attemptsCount,
      maxAttempts: questionnaire.maxAttempts,
      attemptsRemaining
    };
  }
}
