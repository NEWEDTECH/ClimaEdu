/**
 * Output data for retrying a questionnaire
 */
export interface RetryQuestionnaireOutput {
  /**
   * Whether the user can retry the questionnaire
   */
  canRetry: boolean;

  /**
   * The number of attempts already made
   */
  attemptsCount: number;

  /**
   * The maximum number of attempts allowed
   */
  maxAttempts: number;

  /**
   * The number of attempts remaining
   */
  attemptsRemaining: number;
}
