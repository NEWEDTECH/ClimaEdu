import { Questionnaire } from '../../entities/Questionnaire';
import { Lesson } from '../../entities/Lesson';

/**
 * Output data for creating a questionnaire
 */
export interface CreateQuestionnaireOutput {
  questionnaire: Questionnaire;
  lesson: Lesson;
}
