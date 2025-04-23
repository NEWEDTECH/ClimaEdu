import { Course } from '../../core/entities/Course';

/**
 * Interface for the Course repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface CourseRepository {
  /**
   * Generate a new unique ID for a course
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a course by id
   * @param id Course id
   * @returns Course or null if not found
   */
  findById(id: string): Promise<Course | null>;

  /**
   * Save a course
   * @param course Course to save
   * @returns Saved course
   */
  save(course: Course): Promise<Course>;

  /**
   * Delete a course
   * @param id Course id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List courses by institution
   * @param institutionId Institution id
   * @returns List of courses
   */
  listByInstitution(institutionId: string): Promise<Course[]>;
}
