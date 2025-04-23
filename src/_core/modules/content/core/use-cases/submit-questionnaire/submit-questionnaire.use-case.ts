import { injectable, inject } from 'inversify';
import type { QuestionnaireRepository } from '../../../infrastructure/repositories/QuestionnaireRepository';
import type { QuestionnaireSubmissionRepository } from '../../../infrastructure/repositories/QuestionnaireSubmissionRepository';
import { Register } from '@/_core/shared/container';
import { SubmitQuestionnaireInput } from './submit-questionnaire.input';
import { SubmitQuestionnaireOutput } from './submit-questionnaire.output';
import { QuestionnaireSubmission } from '../../entities/QuestionnaireSubmission';
import { QuestionSubmission } from '../../entities/QuestionSubmission';

/**
 * Use case for submitting a questionnaire
 * Following Clean Architecture principles, this use case depends only on the repository interfaces
 */
@injectable()
export class SubmitQuestionnaireUseCase {
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
   * @throws Error if questionnaire not found or validation fails
   */
  async execute(input: SubmitQuestionnaireInput): Promise<SubmitQuestionnaireOutput> {
    // Verify that the questionnaire exists
    const questionnaire = await this.questionnaireRepository.findById(input.questionnaireId);
    if (!questionnaire) {
      throw new Error(`Questionnaire with ID ${input.questionnaireId} not found`);
    }

    // Count the number of attempts for this questionnaire by this user
    const attemptCount = await this.questionnaireSubmissionRepository.countAttempts(
      input.questionnaireId,
      input.userId
    );

    // Check if the user has exceeded the maximum number of attempts
    if (attemptCount >= questionnaire.maxAttempts) {
      throw new Error(`Maximum number of attempts (${questionnaire.maxAttempts}) exceeded`);
    }

    // Generate a new submission ID
    const submissionId = await this.questionnaireSubmissionRepository.generateId();

    // Create question submissions
    const questionSubmissions: QuestionSubmission[] = [];
    
    for (const answer of input.answers) {
      // Find the question in the questionnaire
      const question = questionnaire.questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new Error(`Question with ID ${answer.questionId} not found in questionnaire`);
      }

      // Generate a new question submission ID
      const questionSubmissionId = crypto.randomUUID();

      // Create the question submission
      const questionSubmission = QuestionSubmission.create({
        id: questionSubmissionId,
        questionId: answer.questionId,
        selectedOptionIndex: answer.selectedOptionIndex,
        correctAnswerIndex: question.correctAnswerIndex
      });

      questionSubmissions.push(questionSubmission);
    }

    // Create the questionnaire submission
    const submission = QuestionnaireSubmission.create({
      id: submissionId,
      questionnaireId: input.questionnaireId,
      userId: input.userId,
      institutionId: input.institutionId,
      startedAt: new Date(), // Assuming the submission is completed immediately
      attempt: attemptCount + 1,
      questions: questionSubmissions,
      passingScore: questionnaire.passingScore
    });

    // Save the submission
    const savedSubmission = await this.questionnaireSubmissionRepository.save(submission);

    return {
      submission: savedSubmission,
      passed: savedSubmission.passed,
      score: savedSubmission.score
    };
  }
}
