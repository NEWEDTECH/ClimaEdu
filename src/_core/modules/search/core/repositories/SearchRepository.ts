import { SearchResultEntity, SearchResultType } from '../entities/SearchResult';

export interface SearchFilters {
  types?: SearchResultType[];
  institutionId: string;
  limit?: number;
  offset?: number;
}

export interface SearchRepository {
  search(query: string, filters: SearchFilters): Promise<SearchResultEntity[]>;
  searchByType(query: string, type: SearchResultType, institutionId: string): Promise<SearchResultEntity[]>;
}
