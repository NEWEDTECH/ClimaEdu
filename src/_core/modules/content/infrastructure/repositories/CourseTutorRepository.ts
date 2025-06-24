import { CourseTutor } from '../../core/entities/CourseTutor';

/**
 * Interface for the CourseTutor repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface CourseTutorRepository {
  /**
   * Generate a new unique ID for a course-tutor association
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a course-tutor association by id
   * @param id Association id
   * @returns CourseTutor or null if not found
   */
  findById(id: string): Promise<CourseTutor | null>;

  /**
   * Find associations by user ID
   * @param userId User ID
   * @returns List of CourseTutor
   */
  findByUserId(userId: string): Promise<CourseTutor[]>;

  /**
   * Find associations by course ID
   * @param courseId Course ID
   * @returns List of CourseTutor
   */
  findByCourseId(courseId: string): Promise<CourseTutor[]>;

  /**
   * Find a specific association between user and course
   * @param userId User ID
   * @param courseId Course ID
   * @returns CourseTutor or null if not found
   */
  findByUserAndCourse(userId: string, courseId: string): Promise<CourseTutor | null>;

  /**
   * Save a course-tutor association
   * @param courseTutor CourseTutor to save
   * @returns Saved CourseTutor
   */
  save(courseTutor: CourseTutor): Promise<CourseTutor>;

  /**
   * Delete a course-tutor association
   * @param id Association id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
