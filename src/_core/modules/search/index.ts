// Entities
export { SearchResultEntity, SearchResultType } from '@/_core/modules/search/core/entities/SearchResult';
export type { SearchResult } from '@/_core/modules/search/core/entities/SearchResult';

// Repositories
export type { SearchRepository, SearchFilters } from '@/_core/modules/search/core/repositories/SearchRepository';
export { SearchRepositoryImpl } from '@/_core/modules/search/infrastructure/repositories/SearchRepositoryImpl';

// Use Cases
export { GlobalSearchUseCase } from '@/_core/modules/search/core/use-cases/global-search/global-search.use-case';
export type { GlobalSearchInput, GlobalSearchOutput } from '@/_core/modules/search/core/use-cases/global-search/global-search.use-case';
