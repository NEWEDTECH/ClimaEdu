/**
 * Profile value object representing a user's profile information
 * Following Clean Architecture principles, this value object is pure and has no dependencies on infrastructure
 */
export class Profile {
  private constructor(
    public bio?: string,
    public avatarUrl?: string,
    public linkedinUrl?: string
  ) {}

  /**
   * Creates a new Profile instance
   * @param params Optional profile properties
   * @returns A new Profile instance
   */
  public static create(params?: {
    bio?: string;
    avatarUrl?: string;
    linkedinUrl?: string;
  }): Profile {
    return new Profile(
      params?.bio,
      params?.avatarUrl,
      params?.linkedinUrl
    );
  }

  /**
   * Updates the bio
   * @param newBio The new bio text
   */
  public updateBio(newBio: string): void {
    this.bio = newBio;
  }

  /**
   * Updates the avatar URL
   * @param newAvatarUrl The new avatar URL
   */
  public updateAvatar(newAvatarUrl: string): void {
    this.avatarUrl = newAvatarUrl;
  }

  /**
   * Updates the LinkedIn URL
   * @param newLinkedinUrl The new LinkedIn URL
   */
  public updateLinkedin(newLinkedinUrl: string): void {
    this.linkedinUrl = newLinkedinUrl;
  }
}
