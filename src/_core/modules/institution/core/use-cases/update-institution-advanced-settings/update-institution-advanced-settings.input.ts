import type { InstitutionSettings as GlobalSettings } from '@/_core/shared/config/settings.config';

export interface UpdateInstitutionAdvancedSettingsInput {
  institutionId: string;
  advancedSettings: Partial<GlobalSettings['settings']>;
}