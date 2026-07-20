import { ScheduledClass } from '../../core/entities/ScheduledClass';

/**
 * Interface for the ScheduledClass repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ScheduledClassRepository {
  /**
   * Generate a new unique ID for a scheduled class
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Save a scheduled class (creates or updates)
   * @param scheduledClass The scheduled class to save
   * @returns The saved scheduled class
   */
  save(scheduledClass: ScheduledClass): Promise<ScheduledClass>;

  /**
   * Find a scheduled class by its ID
   * @param id The scheduled class ID
   * @returns The scheduled class if found, null otherwise
   */
  findById(id: string): Promise<ScheduledClass | null>;

  /**
   * Find all scheduled classes created by a tutor, ordered by scheduled date (desc)
   * @param tutorId The tutor's ID
   * @returns Array of scheduled classes
   */
  findByTutorId(tutorId: string): Promise<ScheduledClass[]>;

  /**
   * Find all scheduled classes for a set of classes (turmas), ordered by scheduled date (asc)
   * @param classIds The class (turma) IDs
   * @returns Array of scheduled classes
   */
  findByClassIds(classIds: string[]): Promise<ScheduledClass[]>;

  /**
   * Delete a scheduled class
   * @param id The scheduled class ID
   */
  delete(id: string): Promise<void>;
}
