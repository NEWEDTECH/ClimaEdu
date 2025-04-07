import { User, UserRole } from '../../core/entities/User';
import { Email } from '../../core/entities/Email';
import { Profile } from '../../core/entities/Profile';

/**
 * Data transfer object for creating a user
 */
export interface CreateUserDTO {
  name: string;
  email: Email;
  role: UserRole;
  institutionId: string;
  profile?: Profile;
}

/**
 * Interface for the User repository
 * Following Clean Architecture principles, this is an interface that will be implemented by infrastructure
 */
export interface UserRepository {
  /**
   * Create a new user
   * @param userData User data for creation
   * @returns Created user with id
   */
  create(userData: CreateUserDTO): Promise<User>;

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
   * Update a user
   * @param id User id
   * @param user User data to update
   * @returns Updated user
   */
  update(id: string, user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User>;

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
