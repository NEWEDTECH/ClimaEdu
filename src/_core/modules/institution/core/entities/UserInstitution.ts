/**
 * UserInstitution entity representing an association between a user and an institution
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class UserInstitution {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly institutionId: string,
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
    createdAt?: Date;
    updatedAt?: Date;
  }): UserInstitution {
    if (!params.userId || params.userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!params.institutionId || params.institutionId.trim() === '') {
      throw new Error('Institution ID cannot be empty');
    }

    const now = new Date();
    
    return new UserInstitution(
      params.id,
      params.userId,
      params.institutionId,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
}
