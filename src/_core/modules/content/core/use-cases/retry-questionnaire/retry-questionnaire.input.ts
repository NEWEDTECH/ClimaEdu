/**
 * Input data for retrying a questionnaire
 */
export interface RetryQuestionnaireInput {
  /**
   * The ID of the questionnaire to retry
   */
  questionnaireId: string;

  /**
   * The ID of the user retrying the questionnaire
   */
  userId: string;
}
