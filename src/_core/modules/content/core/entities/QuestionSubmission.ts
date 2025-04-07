/**
 * QuestionSubmission entity representing a student's answer to a question
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class QuestionSubmission {
  private constructor(
    readonly id: string,
    readonly questionId: string,
    readonly selectedOptionIndex: number,
    readonly isCorrect: boolean
  ) {}

  /**
   * Creates a new QuestionSubmission instance
   * @param params QuestionSubmission properties
   * @returns A new QuestionSubmission instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    questionId: string;
    selectedOptionIndex: number;
    correctAnswerIndex?: number;
    isCorrect?: boolean;
  }): QuestionSubmission {
    if (!params.questionId || params.questionId.trim() === '') {
      throw new Error('Question ID cannot be empty');
    }

    if (params.selectedOptionIndex < 0) {
      throw new Error('Selected option index must be a non-negative number');
    }

    // If correctAnswerIndex is provided, evaluate the answer
    // Otherwise, use the provided isCorrect value
    let isCorrect: boolean;
    if (params.correctAnswerIndex !== undefined) {
      isCorrect = QuestionSubmission.evaluate(params.selectedOptionIndex, params.correctAnswerIndex);
    } else if (params.isCorrect !== undefined) {
      isCorrect = params.isCorrect;
    } else {
      throw new Error('Either correctAnswerIndex or isCorrect must be provided');
    }

    return new QuestionSubmission(
      params.id,
      params.questionId,
      params.selectedOptionIndex,
      isCorrect
    );
  }

  /**
   * Evaluates if the selected option is correct
   * @param selectedOptionIndex The index of the selected option
   * @param correctAnswerIndex The index of the correct option
   * @returns True if the selected option is correct, false otherwise
   */
  public static evaluate(selectedOptionIndex: number, correctAnswerIndex: number): boolean {
    return selectedOptionIndex === correctAnswerIndex;
  }
}
