/**
 * Input data for submitting a questionnaire
 */
export interface SubmitQuestionnaireInput {
  /**
   * The ID of the questionnaire to submit
   */
  questionnaireId: string;

  /**
   * The ID of the user submitting the questionnaire
   */
  userId: string;

  /**
   * The ID of the institution the user belongs to
   */
  institutionId: string;

  /**
   * The ID of the module (optional, for achievement event context)
   */
  moduleId?: string;

  /**
   * The ID of the course (optional, for achievement event context)
   */
  courseId?: string;

  /**
   * The answers to the questions
   */
  answers: {
    /**
     * The ID of the question
     */
    questionId: string;

    /**
     * The index of the selected option
     */
    selectedOptionIndex: number;
  }[];
}
