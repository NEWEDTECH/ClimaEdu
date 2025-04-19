// This file serves as the public API for the Badge module

// Re-export entities
export * from './core/entities/Badge';
export * from './core/entities/BadgeCriteriaType';
export * from './core/entities/StudentBadge';

// Re-export use cases
export * from './core/use-cases/view-earned-badges/view-earned-badges.use-case';
export * from './core/use-cases/view-earned-badges/view-earned-badges.input';
export * from './core/use-cases/view-earned-badges/view-earned-badges.output';

// Re-export repository interfaces
export * from './infrastructure/repositories/BadgeRepository';
export * from './infrastructure/repositories/StudentBadgeRepository';

// Re-export repository implementations
// TODO: Implement and export repository implementations
