import { User, UserRole } from '../../core/entities/User';

/**
 * Interface for the User repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface UserRepository {
  /**
   * Generate a new unique ID for a user
   * @returns A unique ID
   */
  generateId(): Promise<string>;

  /**
   * Find a user by id
   * @param id User id
   * @returns User or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Save a user
   * @param user User to save
   * @returns Saved user
   */
  save(user: User): Promise<User>;

  /**
   * Delete a user
   * @param id User id
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * List users by type
   * @param type User type
   * @returns List of users
   */
  listByType(type: UserRole): Promise<User[]>;
}
