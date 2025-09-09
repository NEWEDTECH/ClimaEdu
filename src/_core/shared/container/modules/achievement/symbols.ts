// Achievement module symbols
export const repositories = {
  InstitutionAchievementRepository: Symbol.for('InstitutionAchievementRepository'),
  DefaultAchievementRepository: Symbol.for('DefaultAchievementRepository'),
  StudentAchievementRepository: Symbol.for('StudentAchievementRepository'),
};

export const useCases = {
  CreateInstitutionAchievementUseCase: Symbol.for('CreateInstitutionAchievementUseCase'),
  UpdateInstitutionAchievementUseCase: Symbol.for('UpdateInstitutionAchievementUseCase'),
  DeleteInstitutionAchievementUseCase: Symbol.for('DeleteInstitutionAchievementUseCase'),
  ListInstitutionAchievementsUseCase: Symbol.for('ListInstitutionAchievementsUseCase'),
  GetInstitutionAchievementUseCase: Symbol.for('GetInstitutionAchievementUseCase'),
  ListStudentAchievementsUseCase: Symbol.for('ListStudentAchievementsUseCase'),
};

// Export all symbols for this module
export const AchievementSymbols = {
  repositories,
  useCases,
};