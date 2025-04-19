/**
 * Input data for adding a question to a questionnaire
 */
export interface AddQuestionToQuestionnaireInput {
  /**
   * The ID of the questionnaire to add the question to
   */
  questionnaireId: string;

  /**
   * The text of the question
   */
  questionText: string;

  /**
   * The options for the question (multiple choice)
   */
  options: string[];

  /**
   * The index of the correct answer in the options array
   */
  correctAnswerIndex: number;
}
