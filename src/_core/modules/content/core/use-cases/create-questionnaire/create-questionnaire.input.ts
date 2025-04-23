/**
 * Input data for creating a questionnaire
 */
export interface CreateQuestionnaireInput {
  lessonId: string;
  title: string;
  maxAttempts?: number;
  passingScore?: number;
}
