import { Activity } from '../../core/entities/Activity';

/**
 * Data transfer object for creating an activity
 */
export interface CreateActivityDTO {
  lessonId: string;
  description: string;
  instructions: string;
  resourceUrl?: string;
}

/**
 * Interface for the Activity repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface ActivityRepository {
  /**
   * Create a new activity
   * @param activityData Activity data for creation
   * @returns Created activity
   */
  create(activityData: CreateActivityDTO): Promise<Activity>;

  /**
   * Find an activity by lesson ID
   * @param lessonId Lesson ID
   * @returns Activity or null if not found
   */
  findByLessonId(lessonId: string): Promise<Activity | null>;

  /**
   * Update an activity
   * @param lessonId Lesson ID
   * @param activity Activity data to update
   * @returns Updated activity
   */
  update(lessonId: string, activity: Partial<Activity>): Promise<Activity>;

  /**
   * Delete an activity
   * @param lessonId Lesson ID
   * @returns true if deleted, false if not found
   */
  delete(lessonId: string): Promise<boolean>;
}
