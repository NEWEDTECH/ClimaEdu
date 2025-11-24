import { defaultInstitutionSettings, InstitutionSettings as GlobalSettings } from '@/_core/shared/config/settings.config';

/**
 * InstitutionSettings value object representing customization settings for an institution
 * Following Clean Architecture principles, this value object is pure and has no dependencies on infrastructure
 */
export class InstitutionSettings {
  private constructor(
    public logoUrl?: string,
    public coverImageUrl?: string,
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
    coverImageUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    settings?: Partial<GlobalSettings['settings']>;
  }): InstitutionSettings {
    return new InstitutionSettings(
      params?.logoUrl,
      params?.coverImageUrl,
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

  get courseNavigationSettings() {
    return {
      ...defaultInstitutionSettings.settings.courseNavigation,
      ...this.settings?.courseNavigation,
    };
  }

  get requireSequentialProgress() {
    return this.settings?.courseNavigation?.requireSequentialProgress ?? 
           defaultInstitutionSettings.settings.courseNavigation.requireSequentialProgress;
  }

  get allowSkipLesson() {
    return this.settings?.courseNavigation?.allowSkipLesson ?? 
           defaultInstitutionSettings.settings.courseNavigation.allowSkipLesson;
  }

  /**
   * Updates the logo URL
   * @param newLogoUrl The new logo URL
   * @returns A new InstitutionSettings instance with the updated logo URL
   */
  public updateLogoUrl(newLogoUrl: string): InstitutionSettings {
    return new InstitutionSettings(
      newLogoUrl,
      this.coverImageUrl,
      this.primaryColor,
      this.secondaryColor,
      this.settings
    );
  }

  /**
   * Updates the cover image URL
   * @param newCoverImageUrl The new cover image URL
   * @returns A new InstitutionSettings instance with the updated cover image URL
   */
  public updateCoverImageUrl(newCoverImageUrl: string): InstitutionSettings {
    return new InstitutionSettings(
      this.logoUrl,
      newCoverImageUrl,
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
      this.coverImageUrl,
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
      this.coverImageUrl,
      this.primaryColor,
      newColor,
      this.settings
    );
  }

  /**
   * Updates the advanced settings
   * @param newSettings The new advanced settings
   * @returns A new InstitutionSettings instance with the updated settings
   */
  public updateAdvancedSettings(newSettings: Partial<GlobalSettings['settings']>): InstitutionSettings {
    // Create a new settings object merging current and new settings
    const mergedSettings: Partial<GlobalSettings['settings']> = {
      ...this.settings,
    };

    // Update each setting individually to maintain type safety
    if (newSettings.riskLevels !== undefined) mergedSettings.riskLevels = newSettings.riskLevels;
    if (newSettings.participationLevels !== undefined) mergedSettings.participationLevels = newSettings.participationLevels;
    if (newSettings.performanceRatings !== undefined) mergedSettings.performanceRatings = newSettings.performanceRatings;
    if (newSettings.inactivityThreshold !== undefined) mergedSettings.inactivityThreshold = newSettings.inactivityThreshold;
    if (newSettings.profileCompleteness !== undefined) mergedSettings.profileCompleteness = newSettings.profileCompleteness;
    if (newSettings.courseNavigation !== undefined) mergedSettings.courseNavigation = newSettings.courseNavigation;

    return new InstitutionSettings(
      this.logoUrl,
      this.coverImageUrl,
      this.primaryColor,
      this.secondaryColor,
      mergedSettings
    );
  }

  /**
   * Updates risk level thresholds
   * @param riskLevels The new risk level thresholds
   * @returns A new InstitutionSettings instance with updated risk levels
   */
  public updateRiskLevels(riskLevels: Partial<GlobalSettings['settings']['riskLevels']>): InstitutionSettings {
    const currentRiskLevels: Partial<GlobalSettings['settings']['riskLevels']> = this.settings?.riskLevels || {};
    
    const updatedRiskLevels: GlobalSettings['settings']['riskLevels'] = {
      high: riskLevels.high ?? currentRiskLevels.high ?? defaultInstitutionSettings.settings.riskLevels.high,
      medium: riskLevels.medium ?? currentRiskLevels.medium ?? defaultInstitutionSettings.settings.riskLevels.medium,
    };
    
    return this.updateAdvancedSettings({
      riskLevels: updatedRiskLevels
    });
  }

  /**
   * Updates participation level thresholds
   * @param participationLevels The new participation level thresholds
   * @returns A new InstitutionSettings instance with updated participation levels
   */
  public updateParticipationLevels(participationLevels: Partial<GlobalSettings['settings']['participationLevels']>): InstitutionSettings {
    const currentParticipationLevels: Partial<GlobalSettings['settings']['participationLevels']> = this.settings?.participationLevels || {};
    
    const updatedParticipationLevels: GlobalSettings['settings']['participationLevels'] = {
      high: participationLevels.high ?? currentParticipationLevels.high ?? defaultInstitutionSettings.settings.participationLevels.high,
      medium: participationLevels.medium ?? currentParticipationLevels.medium ?? defaultInstitutionSettings.settings.participationLevels.medium,
    };
    
    return this.updateAdvancedSettings({
      participationLevels: updatedParticipationLevels
    });
  }

  /**
   * Updates performance rating thresholds
   * @param performanceRatings The new performance rating thresholds
   * @returns A new InstitutionSettings instance with updated performance ratings
   */
  public updatePerformanceRatings(performanceRatings: Partial<GlobalSettings['settings']['performanceRatings']>): InstitutionSettings {
    const currentPerformanceRatings: Partial<GlobalSettings['settings']['performanceRatings']> = this.settings?.performanceRatings || {};
    
    const updatedPerformanceRatings: GlobalSettings['settings']['performanceRatings'] = {
      excellent: performanceRatings.excellent ?? currentPerformanceRatings.excellent ?? defaultInstitutionSettings.settings.performanceRatings.excellent,
      good: performanceRatings.good ?? currentPerformanceRatings.good ?? defaultInstitutionSettings.settings.performanceRatings.good,
      average: performanceRatings.average ?? currentPerformanceRatings.average ?? defaultInstitutionSettings.settings.performanceRatings.average,
      belowAverage: performanceRatings.belowAverage ?? currentPerformanceRatings.belowAverage ?? defaultInstitutionSettings.settings.performanceRatings.belowAverage,
    };
    
    return this.updateAdvancedSettings({
      performanceRatings: updatedPerformanceRatings
    });
  }

  /**
   * Updates inactivity threshold
   * @param threshold The new inactivity threshold in days
   * @returns A new InstitutionSettings instance with updated inactivity threshold
   */
  public updateInactivityThreshold(threshold: number): InstitutionSettings {
    return this.updateAdvancedSettings({
      inactivityThreshold: threshold
    });
  }

  /**
   * Updates profile completeness threshold
   * @param threshold The new profile completeness threshold percentage
   * @returns A new InstitutionSettings instance with updated profile completeness
   */
  public updateProfileCompleteness(threshold: number): InstitutionSettings {
    return this.updateAdvancedSettings({
      profileCompleteness: threshold
    });
  }

  /**
   * Updates course navigation settings
   * @param navigationSettings The new course navigation settings
   * @returns A new InstitutionSettings instance with updated navigation settings
   */
  public updateCourseNavigation(navigationSettings: Partial<GlobalSettings['settings']['courseNavigation']>): InstitutionSettings {
    const currentCourseNavigation: Partial<GlobalSettings['settings']['courseNavigation']> = this.settings?.courseNavigation || {};
    
    const updatedCourseNavigation: GlobalSettings['settings']['courseNavigation'] = {
      requireSequentialProgress: navigationSettings.requireSequentialProgress ?? currentCourseNavigation.requireSequentialProgress ?? defaultInstitutionSettings.settings.courseNavigation.requireSequentialProgress,
      allowSkipLesson: navigationSettings.allowSkipLesson ?? currentCourseNavigation.allowSkipLesson ?? defaultInstitutionSettings.settings.courseNavigation.allowSkipLesson,
    };
    
    return this.updateAdvancedSettings({
      courseNavigation: updatedCourseNavigation
    });
  }
}
