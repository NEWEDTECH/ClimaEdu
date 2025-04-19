/**
 * Input data for deleting a question from a questionnaire
 */
export interface DeleteQuestionInput {
  /**
   * The ID of the questionnaire that contains the question
   */
  questionnaireId: string;

  /**
   * The ID of the question to delete
   */
  questionId: string;
}
