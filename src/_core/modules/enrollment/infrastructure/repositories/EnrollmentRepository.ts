import { Enrollment } from '../../core/entities/Enrollment';

/**
 * Interface for the Enrollment repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface EnrollmentRepository {
  /**
   * Generate a new unique ID for an enrollment
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find an enrollment by id
   * @param id Enrollment id
   * @returns Enrollment or null if not found
   */
  findById(id: string): Promise<Enrollment | null>;

  /**
   * Find an enrollment by user and course
   * @param userId User id
   * @param courseId Course id
   * @returns Enrollment or null if not found
   */
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;

  /**
   * Save an enrollment
   * @param enrollment Enrollment to save
   * @returns Saved enrollment
   */
  save(enrollment: Enrollment): Promise<Enrollment>;

  /**
   * Delete an enrollment
   * @param id Enrollment id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List enrollments by user
   * @param userId User id
   * @returns List of enrollments
   */
  listByUser(userId: string): Promise<Enrollment[]>;

  /**
   * List enrollments by course
   * @param courseId Course id
   * @returns List of enrollments
   */
  listByCourse(courseId: string): Promise<Enrollment[]>;
}
