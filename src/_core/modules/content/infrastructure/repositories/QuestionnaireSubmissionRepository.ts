import { QuestionnaireSubmission } from '../../core/entities/QuestionnaireSubmission';

/**
 * Interface for the QuestionnaireSubmission repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface QuestionnaireSubmissionRepository {
  /**
   * Generate a new unique ID for a questionnaire submission
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a questionnaire submission by id
   * @param id Questionnaire submission id
   * @returns Questionnaire submission or null if not found
   */
  findById(id: string): Promise<QuestionnaireSubmission | null>;

  /**
   * Find questionnaire submissions by questionnaire id and user id
   * @param questionnaireId Questionnaire id
   * @param userId User id
   * @returns Array of questionnaire submissions
   */
  findByQuestionnaireAndUser(questionnaireId: string, userId: string): Promise<QuestionnaireSubmission[]>;

  /**
   * Count the number of attempts for a questionnaire by a user
   * @param questionnaireId Questionnaire id
   * @param userId User id
   * @returns Number of attempts
   */
  countAttempts(questionnaireId: string, userId: string): Promise<number>;

  /**
   * Save a questionnaire submission
   * @param submission Questionnaire submission to save
   * @returns Saved questionnaire submission
   */
  save(submission: QuestionnaireSubmission): Promise<QuestionnaireSubmission>;

  /**
   * List questionnaire submissions by user
   * @param userId User id
   * @returns List of questionnaire submissions
   */
  listByUser(userId: string): Promise<QuestionnaireSubmission[]>;

  /**
   * List questionnaire submissions by questionnaire
   * @param questionnaireId Questionnaire id
   * @returns List of questionnaire submissions
   */
  listByQuestionnaire(questionnaireId: string): Promise<QuestionnaireSubmission[]>;
}
