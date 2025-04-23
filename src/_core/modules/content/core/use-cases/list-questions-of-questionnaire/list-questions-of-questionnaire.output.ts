import { Questionnaire } from '../../entities/Questionnaire';
import { Question } from '../../entities/Question';

/**
 * Output data for listing questions of a questionnaire
 */
export interface ListQuestionsOfQuestionnaireOutput {
  /**
   * The list of questions in the questionnaire
   */
  questions: Question[];

  /**
   * The questionnaire that contains the questions
   */
  questionnaire: Questionnaire;
}
