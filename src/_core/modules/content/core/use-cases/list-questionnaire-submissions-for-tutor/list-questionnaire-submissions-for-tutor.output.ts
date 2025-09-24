import type { QuestionnaireSubmission } from '../../entities/QuestionnaireSubmission';
import type { Questionnaire } from '../../entities/Questionnaire';
import type { User } from '../../../../user/core/entities/User';
import type { Course } from '../../entities/Course';

/**
 * Submission with additional context for tutor view
 */
export interface SubmissionWithContext {
  /**
   * The questionnaire submission
   */
  submission: QuestionnaireSubmission;

  /**
   * The questionnaire details
   */
  questionnaire: Questionnaire;

  /**
   * The student who submitted
   */
  student: User;

  /**
   * The course the questionnaire belongs to
   */
  course: Course;

  /**
   * The lesson title (if available)
   */
  lessonTitle?: string;
}

/**
 * Output data for listing questionnaire submissions for tutor
 */
export interface ListQuestionnaireSubmissionsForTutorOutput {
  /**
   * List of submissions with context
   */
  submissions: SubmissionWithContext[];

  /**
   * Total number of submissions
   */
  totalSubmissions: number;

  /**
   * Number of passed submissions
   */
  passedSubmissions: number;

  /**
   * Number of failed submissions
   */
  failedSubmissions: number;

  /**
   * Average score across all submissions
   */
  averageScore: number;
}
