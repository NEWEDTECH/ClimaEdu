// Entities
export { SearchResultEntity, SearchResultType } from './core/entities/SearchResult';
export type { SearchResult } from './core/entities/SearchResult';

// Repositories
export type { SearchRepository, SearchFilters } from './core/repositories/SearchRepository';
export { SearchRepositoryImpl } from './infrastructure/repositories/SearchRepositoryImpl';

// Use Cases
export { GlobalSearchUseCase } from './core/use-cases/global-search/global-search.use-case';
export type { GlobalSearchInput, GlobalSearchOutput } from './core/use-cases/global-search/global-search.use-case';
