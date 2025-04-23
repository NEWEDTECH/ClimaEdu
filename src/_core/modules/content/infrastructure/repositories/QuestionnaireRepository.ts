import { Questionnaire } from '../../core/entities/Questionnaire';

/**
 * Interface for the Questionnaire repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface QuestionnaireRepository {
  /**
   * Generate a new unique ID for a questionnaire
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a questionnaire by id
   * @param id Questionnaire id
   * @returns Questionnaire or null if not found
   */
  findById(id: string): Promise<Questionnaire | null>;

  /**
   * Find a questionnaire by lesson id
   * @param lessonId Lesson id
   * @returns Questionnaire or null if not found
   */
  findByLessonId(lessonId: string): Promise<Questionnaire | null>;

  /**
   * Save a questionnaire
   * @param questionnaire Questionnaire to save
   * @returns Saved questionnaire
   */
  save(questionnaire: Questionnaire): Promise<Questionnaire>;

  /**
   * Delete a questionnaire
   * @param id Questionnaire id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
