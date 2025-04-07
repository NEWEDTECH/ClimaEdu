/**
 * Question entity representing a question in a questionnaire
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Question {
  private constructor(
    readonly id: string,
    public questionText: string,
    public options: string[],
    public correctAnswerIndex: number
  ) {}

  /**
   * Creates a new Question instance
   * @param params Question properties
   * @returns A new Question instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
  }): Question {
    if (!params.questionText || params.questionText.trim() === '') {
      throw new Error('Question text cannot be empty');
    }

    if (!params.options || params.options.length < 2) {
      throw new Error('Question must have at least 2 options');
    }

    if (params.correctAnswerIndex < 0 || params.correctAnswerIndex >= params.options.length) {
      throw new Error('Correct answer index must be valid');
    }

    return new Question(
      params.id,
      params.questionText,
      params.options,
      params.correctAnswerIndex
    );
  }

  /**
   * Updates the question text
   * @param newText The new question text
   * @throws Error if the new text is empty
   */
  public updateQuestionText(newText: string): void {
    if (!newText || newText.trim() === '') {
      throw new Error('Question text cannot be empty');
    }
    this.questionText = newText;
  }

  /**
   * Updates the options
   * @param newOptions The new options
   * @throws Error if the new options are invalid
   */
  public updateOptions(newOptions: string[]): void {
    if (!newOptions || newOptions.length < 2) {
      throw new Error('Question must have at least 2 options');
    }
    
    // If the correct answer index is now invalid, reset it to the first option
    if (this.correctAnswerIndex >= newOptions.length) {
      this.correctAnswerIndex = 0;
    }
    
    this.options = newOptions;
  }

  /**
   * Updates the correct answer index
   * @param index The new correct answer index
   * @throws Error if the index is invalid
   */
  public updateCorrectAnswer(index: number): void {
    if (index < 0 || index >= this.options.length) {
      throw new Error('Correct answer index must be valid');
    }
    this.correctAnswerIndex = index;
  }
}
