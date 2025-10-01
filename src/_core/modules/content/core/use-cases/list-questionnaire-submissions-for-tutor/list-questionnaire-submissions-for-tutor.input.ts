/**
 * Input data for listing questionnaire submissions for tutor
 */
export interface ListQuestionnaireSubmissionsForTutorInput {
  /**
   * The tutor's user ID
   */
  tutorId: string;

  /**
   * The institution ID to filter submissions
   */
  institutionId: string;

  /**
   * Optional course ID to filter submissions by course
   */
  courseId?: string;

  /**
   * Optional student ID to filter submissions by student
   */
  studentId?: string;

  /**
   * Optional questionnaire ID to filter submissions by questionnaire
   */
  questionnaireId?: string;
}
