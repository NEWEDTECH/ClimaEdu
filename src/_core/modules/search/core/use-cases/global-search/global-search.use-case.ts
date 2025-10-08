import { SearchRepository, SearchFilters } from '@/_core/modules/search/core/repositories/SearchRepository';
import { SearchResultEntity, SearchResultType } from '@/_core/modules/search/core/entities/SearchResult';

export interface GlobalSearchInput {
  query: string;
  institutionId: string;
  types?: SearchResultType[];
  limit?: number;
  offset?: number;
}

export interface GlobalSearchOutput {
  results: SearchResultEntity[];
  total: number;
  hasMore: boolean;
}

export class GlobalSearchUseCase {
  constructor(private readonly searchRepository: SearchRepository) {}

  async execute(input: GlobalSearchInput): Promise<GlobalSearchOutput> {
    if (!input.query || input.query.trim().length === 0) {
      return {
        results: [],
        total: 0,
        hasMore: false
      };
    }

    if (!input.institutionId) {
      throw new Error('Institution ID is required for search');
    }

    const filters: SearchFilters = {
      institutionId: input.institutionId,
      types: input.types || [SearchResultType.COURSE, SearchResultType.PODCAST, SearchResultType.TRAIL],
      limit: input.limit || 20,
      offset: input.offset || 0
    };

    const results = await this.searchRepository.search(input.query.trim(), filters);

    return {
      results,
      total: results.length,
      hasMore: results.length === (filters.limit || 20)
    };
  }
}
