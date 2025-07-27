export interface InstitutionSettings {
  settings: {
    riskLevels: {
      high: number;
      medium: number;
    };
    participationLevels: {
      high: number;
      medium: number;
    };
    performanceRatings: {
      excellent: number;
      good: number;
      average: number;
      belowAverage: number;
    };
    inactivityThreshold: number;
  };
}

export const defaultInstitutionSettings: InstitutionSettings = {
  settings: {
    riskLevels: {
      high: 60,
      medium: 75,
    },
    participationLevels: {
      high: 20,
      medium: 10,
    },
    performanceRatings: {
      excellent: 85,
      good: 75,
      average: 65,
      belowAverage: 55,
    },
    inactivityThreshold: 7,
  },
};
