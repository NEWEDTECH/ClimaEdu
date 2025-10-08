import { QuestionSubmission } from './QuestionSubmission';

/**
 * QuestionnaireSubmission entity representing a student's submission for a questionnaire
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class QuestionnaireSubmission {
  private constructor(
    readonly id: string,
    readonly questionnaireId: string,
    readonly userId: string,
    readonly institutionId: string,
    readonly courseId: string,
    readonly startedAt: Date,
    readonly completedAt: Date,
    readonly score: number,
    readonly passed: boolean,
    readonly attempt: number,
    readonly questions: QuestionSubmission[]
  ) {}

  /**
   * Creates a new QuestionnaireSubmission instance
   * @param params QuestionnaireSubmission properties
   * @returns A new QuestionnaireSubmission instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    questionnaireId: string;
    userId: string;
    institutionId: string;
    courseId: string;
    startedAt: Date;
    completedAt?: Date;
    score?: number;
    passed?: boolean;
    attempt: number;
    questions: QuestionSubmission[];
    passingScore?: number;
  }): QuestionnaireSubmission {
    if (!params.questionnaireId || params.questionnaireId.trim() === '') {
      throw new Error('Questionnaire ID cannot be empty');
    }

    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.attempt < 1) {
      throw new Error('Attempt must be a positive number');
    }

    if (!params.questions || params.questions.length === 0) {
      throw new Error('Questions cannot be empty');
    }

    // Default completedAt to now if not provided
    const completedAt = params.completedAt || new Date();

    // Calculate score if not provided
    const score = params.score !== undefined 
      ? params.score 
      : QuestionnaireSubmission.calculateScore(params.questions);

    // Check if passed if not provided
    const passed = params.passed !== undefined 
      ? params.passed 
      : QuestionnaireSubmission.checkPass(score, params.passingScore || 70);

    return new QuestionnaireSubmission(
      params.id,
      params.questionnaireId,
      params.userId,
      params.institutionId,
      params.courseId,
      params.startedAt,
      completedAt,
      score,
      passed,
      params.attempt,
      params.questions
    );
  }

  /**
   * Calculates the score based on correct answers
   * @param questions The question submissions
   * @returns The score as a percentage between 0 and 100
   */
  public static calculateScore(questions: QuestionSubmission[]): number {
    if (questions.length === 0) {
      return 0;
    }

    const correctAnswers = questions.filter(q => q.isCorrect).length;
    return Math.round((correctAnswers / questions.length) * 100);
  }

  /**
   * Determines if the score is sufficient to pass
   * @param score The score to check
   * @param passingScore The minimum passing score
   * @returns True if the score is sufficient to pass, false otherwise
   */
  public static checkPass(score: number, passingScore: number): boolean {
    return score >= passingScore;
  }

  /**
   * Calculates the score for this submission
   * @returns The score as a percentage between 0 and 100
   */
  public calculateScore(): number {
    return QuestionnaireSubmission.calculateScore(this.questions);
  }

  /**
   * Checks if this submission passes based on the given passing score
   * @param passingScore The minimum passing score
   * @returns True if the submission passes, false otherwise
   */
  public checkPass(passingScore: number): boolean {
    return QuestionnaireSubmission.checkPass(this.score, passingScore);
  }
}
