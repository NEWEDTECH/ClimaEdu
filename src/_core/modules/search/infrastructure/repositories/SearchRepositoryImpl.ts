import { SearchRepository, SearchFilters } from '@/_core/modules/search/core/repositories/SearchRepository';
import { SearchResultEntity, SearchResultType } from '@/_core/modules/search/core/entities/SearchResult';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { PodcastRepository } from '@/_core/modules/podcast/infrastructure/repositories/PodcastRepository';
import { TrailRepository } from '@/_core/modules/content/infrastructure/repositories/TrailRepository';

export class SearchRepositoryImpl implements SearchRepository {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly podcastRepository: PodcastRepository,
    private readonly trailRepository: TrailRepository
  ) {}

  async search(query: string, filters: SearchFilters): Promise<SearchResultEntity[]> {
    const results: SearchResultEntity[] = [];
    const searchQuery = query.toLowerCase();

    // Search in courses if type is included
    if (!filters.types || filters.types.includes(SearchResultType.COURSE)) {
      const courseResults = await this.searchByType(searchQuery, SearchResultType.COURSE, filters.institutionId);
      results.push(...courseResults);
    }

    // Search in podcasts if type is included
    if (!filters.types || filters.types.includes(SearchResultType.PODCAST)) {
      const podcastResults = await this.searchByType(searchQuery, SearchResultType.PODCAST, filters.institutionId);
      results.push(...podcastResults);
    }

    // Search in trails if type is included
    if (!filters.types || filters.types.includes(SearchResultType.TRAIL)) {
      const trailResults = await this.searchByType(searchQuery, SearchResultType.TRAIL, filters.institutionId);
      results.push(...trailResults);
    }

    // Sort by relevance (title matches first, then description matches)
    const sortedResults = results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact title matches first
      if (aTitle.includes(searchQuery) && !bTitle.includes(searchQuery)) return -1;
      if (!aTitle.includes(searchQuery) && bTitle.includes(searchQuery)) return 1;
      
      // Then by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    
    return sortedResults.slice(offset, offset + limit);
  }

  async searchByType(query: string, type: SearchResultType, institutionId: string): Promise<SearchResultEntity[]> {
    const results: SearchResultEntity[] = [];
    const searchQuery = query.toLowerCase();

    try {
      switch (type) {
        case SearchResultType.COURSE:
          const courses = await this.courseRepository.listByInstitution(institutionId);
          for (const course of courses) {
            if (
              course.title.toLowerCase().includes(searchQuery) ||
              course.description?.toLowerCase().includes(searchQuery)
            ) {
              results.push(SearchResultEntity.create({
                id: course.id,
                title: course.title,
                description: course.description || undefined,
                type: SearchResultType.COURSE,
                imageUrl: course.coverImageUrl || undefined,
                href: `/student/courses/${course.id}`,
                institutionId: course.institutionId,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt
              }));
            }
          }
          break;

        case SearchResultType.PODCAST:
          const podcastsResult = await this.podcastRepository.findByInstitutionId(institutionId, {
            page: 1,
            limit: 100, // Get more to filter properly
            sortBy: 'createdAt',
            sortOrder: 'desc'
          });
          
          for (const podcast of podcastsResult) {
            if (
              podcast.title.toLowerCase().includes(searchQuery) ||
              podcast.description?.toLowerCase().includes(searchQuery)
            ) {
              results.push(SearchResultEntity.create({
                id: podcast.id,
                title: podcast.title,
                description: podcast.description || undefined,
                type: SearchResultType.PODCAST,
                imageUrl: podcast.coverImageUrl || undefined,
                href: `/podcast/${podcast.id}`,
                institutionId: podcast.institutionId,
                createdAt: podcast.createdAt,
                updatedAt: podcast.updatedAt
              }));
            }
          }
          break;

        case SearchResultType.TRAIL:
          const trailsResult = await this.trailRepository.findAll(institutionId);
          
          for (const trail of trailsResult) {
            if (
              trail.title.toLowerCase().includes(searchQuery) ||
              trail.description?.toLowerCase().includes(searchQuery)
            ) {
              results.push(SearchResultEntity.create({
                id: trail.id,
                title: trail.title,
                description: trail.description || undefined,
                type: SearchResultType.TRAIL,
                imageUrl: trail.coverImageUrl || undefined,
                href: `/student/trails/${trail.id}`,
                institutionId: trail.institutionId,
                createdAt: trail.createdAt,
                updatedAt: trail.updatedAt
              }));
            }
          }
          break;
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      // Continue with other types even if one fails
    }

    return results;
  }
}
