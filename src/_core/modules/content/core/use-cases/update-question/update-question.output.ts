import { Questionnaire } from '../../entities/Questionnaire';
import { Question } from '../../entities/Question';

/**
 * Output data for updating a question
 */
export interface UpdateQuestionOutput {
  /**
   * The updated questionnaire
   */
  questionnaire: Questionnaire;

  /**
   * The updated question
   */
  question: Question;
}
