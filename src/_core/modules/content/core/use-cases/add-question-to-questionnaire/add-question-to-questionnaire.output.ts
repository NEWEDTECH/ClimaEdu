import { Questionnaire } from '../../entities/Questionnaire';
import { Question } from '../../entities/Question';

/**
 * Output data for adding a question to a questionnaire
 */
export interface AddQuestionToQuestionnaireOutput {
  /**
   * The updated questionnaire with the new question
   */
  questionnaire: Questionnaire;

  /**
   * The created question
   */
  question: Question;
}
