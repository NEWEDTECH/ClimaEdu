import { QuestionnaireSubmission } from '../../entities/QuestionnaireSubmission';

/**
 * Output data for submitting a questionnaire
 */
export interface SubmitQuestionnaireOutput {
  /**
   * The created questionnaire submission
   */
  submission: QuestionnaireSubmission;

  /**
   * Whether the submission passed the questionnaire
   */
  passed: boolean;

  /**
   * The score of the submission (percentage)
   */
  score: number;
}
