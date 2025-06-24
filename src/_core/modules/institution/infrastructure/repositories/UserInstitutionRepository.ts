import { UserInstitution } from '../../core/entities/UserInstitution';

/**
 * Interface for the UserInstitution repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface UserInstitutionRepository {
  /**
   * Generate a new unique ID for a user-institution association
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a user-institution association by id
   * @param id Association id
   * @returns UserInstitution or null if not found
   */
  findById(id: string): Promise<UserInstitution | null>;

  /**
   * Find associations by user ID
   * @param userId User ID
   * @returns List of UserInstitution
   */
  findByUserId(userId: string): Promise<UserInstitution[]>;

  /**
   * Find associations by institution ID
   * @param institutionId Institution ID
   * @returns List of UserInstitution
   */
  findByInstitutionId(institutionId: string): Promise<UserInstitution[]>;

  /**
   * Find a specific association between user and institution
   * @param userId User ID
   * @param institutionId Institution ID
   * @returns UserInstitution or null if not found
   */
  findByUserAndInstitution(userId: string, institutionId: string): Promise<UserInstitution | null>;

  /**
   * Save a user-institution association
   * @param userInstitution UserInstitution to save
   * @returns Saved UserInstitution
   */
  save(userInstitution: UserInstitution): Promise<UserInstitution>;

  /**
   * Delete a user-institution association
   * @param id Association id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
