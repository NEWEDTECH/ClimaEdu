import { Module } from '../../core/entities/Module';

/**
 * Interface for the Module repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ModuleRepository {
  /**
   * Generate a new unique ID for a module
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a module by id
   * @param id Module id
   * @returns Module or null if not found
   */
  findById(id: string): Promise<Module | null>;

  /**
   * Save a module
   * @param module Module to save
   * @returns Saved module
   */
  save(module: Module): Promise<Module>;

  /**
   * Delete a module
   * @param id Module id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List modules by course
   * @param courseId Course id
   * @returns List of modules
   */
  listByCourse(courseId: string): Promise<Module[]>;
}
