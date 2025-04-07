import { Email } from './Email';
import { Profile } from './Profile';

/**
 * Enum representing the types of users in the system
 */
export enum UserRole {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
}

/**
 * User entity representing a user in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class User {
  private constructor(
    readonly id: string,
    readonly institutionId: string,
    public name: string,
    public email: Email,
    public role: UserRole,
    readonly createdAt: Date,
    public updatedAt: Date,
    public profile?: Profile
  ) {}

  /**
   * Creates a new User instance
   * @param params User properties
   * @returns A new User instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    institutionId: string;
    name: string;
    email: Email;
    role: UserRole;
    profile?: Profile;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }
    const now = new Date();
    
    return new User(
      params.id,
      params.institutionId,
      params.name,
      params.email,
      params.role,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.profile
    );
  }

  /**
   * Updates the user's name
   * @param newName The new name
   */
  public updateName(newName: string): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  /**
   * Updates the user's email
   * @param newEmail The new email
   */
  public updateEmail(newEmail: Email): void {
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  /**
   * Updates the user's role
   * @param newRole The new role
   */
  public updateRole(newRole: UserRole): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  /**
   * Attaches a profile to the user
   * @param profile The profile to attach
   */
  public attachProfile(profile: Profile): void {
    this.profile = profile;
    this.updatedAt = new Date();
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
}
