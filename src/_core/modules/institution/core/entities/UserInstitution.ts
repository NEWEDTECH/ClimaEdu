import { UserRole } from '../../../user/core/entities/User';

/**
 * UserInstitution entity representing an association between a user and an institution
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class UserInstitution {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly institutionId: string,
    public userRole: UserRole,
    readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new UserInstitution instance
   * @param params UserInstitution properties
   * @returns A new UserInstitution instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    userId: string;
    institutionId: string;
    userRole: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserInstitution {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    if (params.userRole !== UserRole.LOCAL_ADMIN) {
      throw new Error('UserRole must be LOCAL_ADMIN for UserInstitution association');
    }

    const now = new Date();
    
    return new UserInstitution(
      params.id,
      params.userId,
      params.institutionId,
      params.userRole,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Updates the user role for this institution association
   * @param newUserRole The new user role (must be LOCAL_ADMIN or CONTENT_MANAGER)
   */
  public updateUserRole(newUserRole: UserRole): void {
    if (newUserRole !== UserRole.LOCAL_ADMIN) {
      throw new Error('UserRole must be LOCAL_ADMIN for UserInstitution association');
    }
    
    this.userRole = newUserRole;
    this.updatedAt = new Date();
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
}
