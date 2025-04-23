/**
 * Input data for updating a question
 */
export interface UpdateQuestionInput {
  /**
   * The ID of the questionnaire that contains the question
   */
  questionnaireId: string;

  /**
   * The ID of the question to update
   */
  questionId: string;

  /**
   * The new text of the question (optional)
   */
  questionText?: string;

  /**
   * The new options for the question (optional)
   */
  options?: string[];

  /**
   * The new index of the correct answer (optional)
   */
  correctAnswerIndex?: number;
}
