// Entities
export * from './core/entities';

// Use Cases
export { CreateInstitutionAchievementUseCase } from './core/use-cases/create-institution-achievement/create-institution-achievement.use-case';
export { ListInstitutionAchievementsUseCase } from './core/use-cases/list-institution-achievements/list-institution-achievements.use-case';
export { GetInstitutionAchievementUseCase } from './core/use-cases/get-institution-achievement/get-institution-achievement.use-case';
export { ListStudentAchievementsUseCase } from './core/use-cases/list-student-achievements/list-student-achievements.use-case';

// Use Case Inputs/Outputs
export type { CreateInstitutionAchievementInput } from './core/use-cases/create-institution-achievement/create-institution-achievement.input';
export type { CreateInstitutionAchievementOutput } from './core/use-cases/create-institution-achievement/create-institution-achievement.output';
export type { ListInstitutionAchievementsInput } from './core/use-cases/list-institution-achievements/list-institution-achievements.input';
export type { ListInstitutionAchievementsOutput } from './core/use-cases/list-institution-achievements/list-institution-achievements.output';
export type { GetInstitutionAchievementInput } from './core/use-cases/get-institution-achievement/get-institution-achievement.input';
export type { GetInstitutionAchievementOutput } from './core/use-cases/get-institution-achievement/get-institution-achievement.output';
export type { ListStudentAchievementsInput } from './core/use-cases/list-student-achievements/list-student-achievements.input';
export type { ListStudentAchievementsOutput } from './core/use-cases/list-student-achievements/list-student-achievements.output';

// Repositories
export type { InstitutionAchievementRepository } from './infrastructure/repositories/InstitutionAchievementRepository';
export type { DefaultAchievementRepository } from './infrastructure/repositories/DefaultAchievementRepository';
export type { StudentAchievementRepository } from './infrastructure/repositories/StudentAchievementRepository';

// Repository Implementations
export { FirebaseInstitutionAchievementRepository } from './infrastructure/repositories/implementations/FirebaseInstitutionAchievementRepository';
export { FirebaseDefaultAchievementRepository } from './infrastructure/repositories/implementations/FirebaseDefaultAchievementRepository';
export { FirebaseStudentAchievementRepository } from './infrastructure/repositories/implementations/FirebaseStudentAchievementRepository';