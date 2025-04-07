import { InstitutionSettings } from './InstitutionSettings';

/**
 * Institution entity representing an organization in the system
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Institution {
  private constructor(
    readonly id: string,
    public name: string,
    public domain: string,
    public settings: InstitutionSettings,
    readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Creates a new Institution instance
   * @param params Institution properties
   * @returns A new Institution instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    name: string;
    domain: string;
    settings?: InstitutionSettings;
    createdAt?: Date;
    updatedAt?: Date;
  }): Institution {
    if (!params.name || params.name.trim() === '') {
      throw new Error('Institution name cannot be empty');
    }

    if (!params.domain || params.domain.trim() === '') {
      throw new Error('Institution domain cannot be empty');
    }

    // Validate domain format
    if (!Institution.isValidDomain(params.domain)) {
      throw new Error('Invalid domain format');
    }

    const now = new Date();
    const settings = params.settings ?? InstitutionSettings.create();

    return new Institution(
      params.id,
      params.name,
      params.domain,
      settings,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  /**
   * Validates if the provided string is in a valid domain format
   * @param domain The domain string to validate
   * @returns True if the domain format is valid, false otherwise
   */
  private static isValidDomain(domain: string): boolean {
    // Simple domain validation (can be enhanced as needed)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  }

  /**
   * Updates the institution name
   * @param newName The new name
   * @throws Error if the new name is empty
   */
  public updateName(newName: string): void {
    if (!newName || newName.trim() === '') {
      throw new Error('Institution name cannot be empty');
    }
    this.name = newName;
    this.touch();
  }

  /**
   * Updates the institution domain
   * @param newDomain The new domain
   * @throws Error if the new domain is empty or invalid
   */
  public updateDomain(newDomain: string): void {
    if (!newDomain || newDomain.trim() === '') {
      throw new Error('Institution domain cannot be empty');
    }

    if (!Institution.isValidDomain(newDomain)) {
      throw new Error('Invalid domain format');
    }

    this.domain = newDomain;
    this.touch();
  }

  /**
   * Updates the institution settings
   * @param newSettings The new settings
   */
  public updateSettings(newSettings: InstitutionSettings): void {
    this.settings = newSettings;
    this.touch();
  }

  /**
   * Updates the timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
}
