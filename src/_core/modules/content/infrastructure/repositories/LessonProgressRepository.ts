import { LessonProgress } from '../../core/entities/LessonProgress';

/**
 * Repository interface for LessonProgress operations
 * Following Clean Architecture principles, this interface is defined in the core layer
 * and will be implemented by infrastructure layer
 */
export interface LessonProgressRepository {
  /**
   * Generate a new unique ID for a lesson progress
   * @returns A unique ID with the lesson progress prefix
   */
  generateId(): Promise<string>;

  /**
   * Find lesson progress by user and lesson
   * @param userId User ID
   * @param lessonId Lesson ID
   * @returns LessonProgress or null if not found
   */
  findByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null>;

  /**
   * Find all lesson progresses for a specific user
   * @param userId User ID
   * @returns Array of LessonProgress
   */
  findByUser(userId: string): Promise<LessonProgress[]>;

  /**
   * Find all lesson progresses for a specific user within an institution
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns Array of LessonProgress
   */
  findByUserAndInstitution(userId: string, institutionId: string): Promise<LessonProgress[]>;

  /**
   * Find all lesson progresses for a specific lesson
   * @param lessonId Lesson ID
   * @returns Array of LessonProgress
   */
  findByLesson(lessonId: string): Promise<LessonProgress[]>;

  /**
   * Find all lesson progresses for a specific lesson within an institution
   * @param lessonId Lesson ID
   * @param institutionId Institution ID
   * @returns Array of LessonProgress
   */
  findByLessonAndInstitution(lessonId: string, institutionId: string): Promise<LessonProgress[]>;

  /**
   * Find all lesson progresses within an institution
   * @param institutionId Institution ID
   * @returns Array of LessonProgress
   */
  findByInstitution(institutionId: string): Promise<LessonProgress[]>;

  /**
   * Find completed lesson progresses for a user
   * @param userId User ID
   * @returns Array of completed LessonProgress
   */
  findCompletedByUser(userId: string): Promise<LessonProgress[]>;

  /**
   * Find in-progress lesson progresses for a user
   * @param userId User ID
   * @returns Array of in-progress LessonProgress
   */
  findInProgressByUser(userId: string): Promise<LessonProgress[]>;

  /**
   * Save a lesson progress
   * @param lessonProgress LessonProgress to save
   * @returns Saved LessonProgress
   */
  save(lessonProgress: LessonProgress): Promise<LessonProgress>;

  /**
   * Delete a lesson progress
   * @param id LessonProgress ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a lesson progress exists for a user and lesson
   * @param userId User ID
   * @param lessonId Lesson ID
   * @returns true if exists, false otherwise
   */
  exists(userId: string, lessonId: string): Promise<boolean>;

  /**
   * Count total lesson progresses for a user
   * @param userId User ID
   * @returns Number of lesson progresses
   */
  countByUser(userId: string): Promise<number>;

  /**
   * Count completed lesson progresses for a user
   * @param userId User ID
   * @returns Number of completed lesson progresses
   */
  countCompletedByUser(userId: string): Promise<number>;

  /**
   * Count lesson progresses for a lesson
   * @param lessonId Lesson ID
   * @returns Number of lesson progresses
   */
  countByLesson(lessonId: string): Promise<number>;

  /**
   * Count completed lesson progresses for a lesson
   * @param lessonId Lesson ID
   * @returns Number of completed lesson progresses
   */
  countCompletedByLesson(lessonId: string): Promise<number>;
}
