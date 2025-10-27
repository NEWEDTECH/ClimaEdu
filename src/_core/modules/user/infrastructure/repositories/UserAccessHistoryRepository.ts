import { UserAccessHistory } from '../../core/entities/UserAccessHistory';

/**
 * Repository interface for UserAccessHistory operations
 *
 * Following Clean Architecture principles, this interface is defined in the infrastructure layer
 * but depends only on domain entities.
 *
 * Manages user access history stored in Firestore subcollection:
 * /users/{userId}/access-history/{institutionId}
 */
export interface UserAccessHistoryRepository {
  /**
   * Generate a new unique ID for a user access history record
   *
   * @returns A unique ID with the user access history prefix
   */
  generateId(): Promise<string>;

  /**
   * Find access history by user and institution
   *
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns UserAccessHistory or null if not found
   */
  findByUserAndInstitution(
    userId: string,
    institutionId: string
  ): Promise<UserAccessHistory | null>;

  /**
   * Find all access histories for a specific user across all institutions
   *
   * @param userId User ID
   * @returns Array of UserAccessHistory
   */
  findByUser(userId: string): Promise<UserAccessHistory[]>;

  /**
   * Save a user access history record
   *
   * Creates a new record if it doesn't exist, updates if it does.
   *
   * @param accessHistory UserAccessHistory to save
   * @returns Saved UserAccessHistory
   */
  save(accessHistory: UserAccessHistory): Promise<UserAccessHistory>;

  /**
   * Delete a user access history record
   *
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns true if deleted, false if not found
   */
  delete(userId: string, institutionId: string): Promise<boolean>;

  /**
   * Count total access history records for a user
   *
   * @param userId User ID
   * @returns Number of access history records
   */
  countByUser(userId: string): Promise<number>;

  /**
   * Check if an access history record exists for a user and institution
   *
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns true if exists, false otherwise
   */
  exists(userId: string, institutionId: string): Promise<boolean>;
}
