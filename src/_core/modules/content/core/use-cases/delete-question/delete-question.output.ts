import { Questionnaire } from '../../entities/Questionnaire';

/**
 * Output data for deleting a question from a questionnaire
 */
export interface DeleteQuestionOutput {
  /**
   * The updated questionnaire without the deleted question
   */
  questionnaire: Questionnaire;
}
