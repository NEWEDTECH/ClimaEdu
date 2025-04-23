import { Badge } from '../../core/entities/Badge';
import { BadgeCriteriaType } from '../../core/entities/BadgeCriteriaType';

/**
 * Interface for the Badge repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface BadgeRepository {
  /**
   * Generate a new unique ID for a badge
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a badge by id
   * @param id Badge id
   * @returns Badge or null if not found
   */
  findById(id: string): Promise<Badge | null>;

  /**
   * Find badges by criteria type
   * @param criteriaType The type of criteria to filter by
   * @returns Array of badges
   */
  findByCriteriaType(criteriaType: BadgeCriteriaType): Promise<Badge[]>;

  /**
   * List all badges
   * @returns Array of all badges
   */
  listAll(): Promise<Badge[]>;

  /**
   * Save a badge
   * @param badge Badge to save
   * @returns Saved badge
   */
  save(badge: Badge): Promise<Badge>;

  /**
   * Delete a badge
   * @param id Badge id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
