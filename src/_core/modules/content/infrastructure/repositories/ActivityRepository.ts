import { Activity } from '../../core/entities/Activity';

/**
 * Interface for the Activity repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ActivityRepository {
  /**
   * Generate a new unique ID for an activity
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find an activity by lesson ID
   * @param lessonId Lesson ID
   * @returns Activity or null if not found
   */
  findByLessonId(lessonId: string): Promise<Activity | null>;

  /**
   * Save an activity
   * @param activity Activity to save
   * @returns Saved activity
   */
  save(activity: Activity): Promise<Activity>;

  /**
   * Delete an activity
   * @param lessonId Lesson ID
   * @returns true if deleted, false if not found
   */
  delete(lessonId: string): Promise<boolean>;
}
