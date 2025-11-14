import { Lesson } from '../../core/entities/Lesson';

/**
 * Interface for the Lesson repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface LessonRepository {
  /**
   * Generate a new unique ID for a lesson
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a lesson by id
   * @param id Lesson id
   * @returns Lesson or null if not found
   */
  findById(id: string): Promise<Lesson | null>;

  /**
   * Save a lesson
   * @param lesson Lesson to save
   * @returns Saved lesson
   */
  save(lesson: Lesson): Promise<Lesson>;

  /**
   * Delete a lesson
   * @param id Lesson id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List lessons by module
   * @param moduleId Module id
   * @returns List of lessons
   */
  listByModule(moduleId: string): Promise<Lesson[]>;

  /**
   * Count lessons in a module
   * @param moduleId Module id
   * @returns Number of lessons in the module
   */
  countByModule(moduleId: string): Promise<number>;

  /**
   * Reorder lessons in a module
   * This is used when inserting a new lesson at a specific position
   * @param moduleId Module id
   * @param startOrder The order from which to start reordering
   * @returns true if successful
   */
  reorderLessons(moduleId: string, startOrder: number): Promise<boolean>;

  /**
   * Update the order of a lesson
   * @param id Lesson id
   * @param order New order value
   */
  updateOrder(id: string, order: number): Promise<void>;
}
