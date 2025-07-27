import { defaultInstitutionSettings, InstitutionSettings as GlobalSettings } from '@/_core/shared/config/settings.config';

/**
 * InstitutionSettings value object representing customization settings for an institution
 * Following Clean Architecture principles, this value object is pure and has no dependencies on infrastructure
 */
export class InstitutionSettings {
  private constructor(
    public logoUrl?: string,
    public primaryColor?: string,
    public secondaryColor?: string,
    public settings?: Partial<GlobalSettings['settings']>
  ) {}

  /**
   * Creates a new InstitutionSettings instance
   * @param params Optional settings properties
   * @returns A new InstitutionSettings instance
   */
  public static create(params?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    settings?: Partial<GlobalSettings['settings']>;
  }): InstitutionSettings {
    return new InstitutionSettings(
      params?.logoUrl,
      params?.primaryColor,
      params?.secondaryColor,
      params?.settings
    );
  }

  get riskLevelThresholds() {
    return {
      ...defaultInstitutionSettings.settings.riskLevels,
      ...this.settings?.riskLevels,
    };
  }

  get participationLevelThresholds() {
    return {
      ...defaultInstitutionSettings.settings.participationLevels,
      ...this.settings?.participationLevels,
    };
  }

  get performanceRatingThresholds() {
    return {
      ...defaultInstitutionSettings.settings.performanceRatings,
      ...this.settings?.performanceRatings,
    };
  }

  get inactivityThreshold() {
    return this.settings?.inactivityThreshold ?? defaultInstitutionSettings.settings.inactivityThreshold;
  }

  get profileCompleteness() {
    return this.settings?.profileCompleteness ?? defaultInstitutionSettings.settings.profileCompleteness;
  }

  /**
   * Updates the logo URL
   * @param newLogoUrl The new logo URL
   * @returns A new InstitutionSettings instance with the updated logo URL
   */
  public updateLogoUrl(newLogoUrl: string): InstitutionSettings {
    return new InstitutionSettings(
      newLogoUrl,
      this.primaryColor,
      this.secondaryColor,
      this.settings
    );
  }

  /**
   * Updates the primary color
   * @param newColor The new primary color
   * @returns A new InstitutionSettings instance with the updated primary color
   */
  public updatePrimaryColor(newColor: string): InstitutionSettings {
    return new InstitutionSettings(
      this.logoUrl,
      newColor,
      this.secondaryColor,
      this.settings
    );
  }

  /**
   * Updates the secondary color
   * @param newColor The new secondary color
   * @returns A new InstitutionSettings instance with the updated secondary color
   */
  public updateSecondaryColor(newColor: string): InstitutionSettings {
    return new InstitutionSettings(
      this.logoUrl,
      this.primaryColor,
      newColor,
      this.settings
    );
  }
}
