/**
 * MyAssessmentReport
 * 
 * Persona: Student
 * Purpose: Display the student's scores in each questionnaire.
 * Fields:
 * - userId: Identifies the student viewing their own assessment results
 * - questionnaireId: Identifies the specific questionnaire being reported on
 * - institutionId: The institution context for this report
 * - score: The student's score on the questionnaire (0-100)
 * - passed: Whether the student passed the questionnaire based on the passing score
 * - attemptNumber: Which attempt this score represents (e.g., 1st, 2nd, 3rd)
 */
export class MyAssessmentReport {
  private constructor(
    readonly userId: string,
    readonly questionnaireId: string,
    readonly institutionId: string,
    readonly score: number,
    readonly passed: boolean,
    readonly attemptNumber: number
  ) {}

  /**
   * Creates a new MyAssessmentReport instance
   * @param params Report properties
   * @returns A new MyAssessmentReport instance
   * @throws Error if validation fails
   */
  public static create(params: {
    userId: string;
    questionnaireId: string;
    institutionId: string;
    score: number;
    passed: boolean;
    attemptNumber: number;
  }): MyAssessmentReport {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.questionnaireId || params.questionnaireId.trim() === '') {
      throw new Error('Questionnaire ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.score < 0 || params.score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    if (params.attemptNumber < 1) {
      throw new Error('Attempt number must be at least 1');
    }

    return new MyAssessmentReport(
      params.userId,
      params.questionnaireId,
      params.institutionId,
      params.score,
      params.passed,
      params.attemptNumber
    );
  }
}
