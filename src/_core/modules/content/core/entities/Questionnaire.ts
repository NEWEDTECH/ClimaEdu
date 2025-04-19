import { Question } from './Question';

/**
 * Questionnaire entity representing a set of questions for a lesson
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Questionnaire {
  private constructor(
    readonly id: string,
    readonly lessonId: string,
    public title: string,
    public questions: Question[],
    public maxAttempts: number,
    public passingScore: number
  ) {}

  /**
   * Creates a new Questionnaire instance
   * @param params Questionnaire properties
   * @returns A new Questionnaire instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    lessonId: string;
    title: string;
    questions?: Question[];
    maxAttempts?: number;
    passingScore?: number;
  }): Questionnaire {
    if (!params.title || params.title.trim() === '') {
      throw new Error('Questionnaire title cannot be empty');
    }

    // Default maxAttempts to 3 if not provided
    const maxAttempts = params.maxAttempts !== undefined ? params.maxAttempts : 3;
    
    // Validate maxAttempts
    if (maxAttempts < 1) {
      throw new Error('Maximum attempts must be at least 1');
    }
    
    // Default passingScore to 70 if not provided
    const passingScore = params.passingScore !== undefined ? params.passingScore : 70;
    
    // Validate passingScore
    if (passingScore < 0 || passingScore > 100) {
      throw new Error('Passing score must be between 0 and 100');
    }

    return new Questionnaire(
      params.id,
      params.lessonId,
      params.title,
      params.questions || [],
      maxAttempts,
      passingScore
    );
  }

  /**
   * Adds a question to the questionnaire
   * @param question The question to add
   */
  public addQuestion(question: Question): void {
    this.questions.push(question);
  }

  /**
   * Removes a question from the questionnaire
   * @param questionId The ID of the question to remove
   * @returns true if the question was found and removed, false otherwise
   * @throws Error if the question is not found
   */
  public removeQuestion(questionId: string): boolean {
    const questionIndex = this.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      throw new Error(`Question with ID ${questionId} not found in questionnaire`);
    }
    
    this.questions = this.questions.filter(q => q.id !== questionId);
    return true;
  }

  /**
   * Lists all questions in the questionnaire
   * @returns Array of questions
   */
  public listQuestions(): Question[] {
    return this.questions;
  }

  /**
   * Finds a question by ID
   * @param questionId The ID of the question to find
   * @returns The question if found
   * @throws Error if the question is not found
   */
  public findQuestionById(questionId: string): Question {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question with ID ${questionId} not found in questionnaire`);
    }
    return question;
  }

  /**
   * Updates the questionnaire title
   * @param newTitle The new title
   * @throws Error if the new title is empty
   */
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Questionnaire title cannot be empty');
    }
    this.title = newTitle;
  }

  /**
   * Updates the maximum number of attempts allowed
   * @param maxAttempts The new maximum number of attempts
   * @throws Error if the new maximum attempts is less than 1
   */
  public updateMaxAttempts(maxAttempts: number): void {
    if (maxAttempts < 1) {
      throw new Error('Maximum attempts must be at least 1');
    }
    this.maxAttempts = maxAttempts;
  }

  /**
   * Updates the passing score
   * @param passingScore The new passing score
   * @throws Error if the new passing score is not between 0 and 100
   */
  public updatePassingScore(passingScore: number): void {
    if (passingScore < 0 || passingScore > 100) {
      throw new Error('Passing score must be between 0 and 100');
    }
    this.passingScore = passingScore;
  }

  /**
   * Checks if a student has attempts remaining
   * @param currentAttempt The current attempt number
   * @returns True if the student has attempts remaining, false otherwise
   */
  public hasAttemptsRemaining(currentAttempt: number): boolean {
    return currentAttempt < this.maxAttempts;
  }
}
