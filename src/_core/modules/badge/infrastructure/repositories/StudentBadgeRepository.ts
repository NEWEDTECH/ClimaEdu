import { Badge } from '../../core/entities/Badge';
import { StudentBadge } from '../../core/entities/StudentBadge';

/**
 * Interface for the StudentBadge repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface StudentBadgeRepository {
  /**
   * Generate a new unique ID for a student badge
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a student badge by id
   * @param id Student badge id
   * @returns Student badge or null if not found
   */
  findById(id: string): Promise<StudentBadge | null>;

  /**
   * Find student badges by user id
   * @param userId User id
   * @param institutionId Institution id
   * @returns Array of student badges
   */
  findByUser(userId: string, institutionId: string): Promise<StudentBadge[]>;

  /**
   * Find student badges by badge id
   * @param badgeId Badge id
   * @param institutionId Institution id
   * @returns Array of student badges
   */
  findByBadge(badgeId: string, institutionId: string): Promise<StudentBadge[]>;

  /**
   * Check if a user has a specific badge
   * @param userId User id
   * @param badgeId Badge id
   * @param institutionId Institution id
   * @returns True if the user has the badge, false otherwise
   */
  hasUserEarnedBadge(userId: string, badgeId: string, institutionId: string): Promise<boolean>;

  /**
   * Get all badges earned by a user with badge details
   * @param userId User id
   * @param institutionId Institution id
   * @returns Array of badges with their details
   */
  getEarnedBadgesWithDetails(userId: string, institutionId: string): Promise<{
    studentBadge: StudentBadge;
    badge: Badge;
  }[]>;

  /**
   * Save a student badge
   * @param studentBadge Student badge to save
   * @returns Saved student badge
   */
  save(studentBadge: StudentBadge): Promise<StudentBadge>;

  /**
   * Delete a student badge
   * @param id Student badge id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
