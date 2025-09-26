import { Container } from 'inversify';
import { Register } from '../../symbols';

// Import search module dependencies
import { SearchRepository, SearchRepositoryImpl } from '../../../../modules/search';
import { GlobalSearchUseCase } from '../../../../modules/search';

// Import dependencies from other modules
import { CourseRepository } from '../../../../modules/content/infrastructure/repositories/CourseRepository';
import { PodcastRepository } from '../../../../modules/podcast/infrastructure/repositories/PodcastRepository';
import { TrailRepository } from '../../../../modules/content/infrastructure/repositories/TrailRepository';

export function registerSearchModule(container: Container): void {
  // Repository
  container.bind<SearchRepository>(Register.search.repository.SearchRepository)
    .toDynamicValue(() => {
      const courseRepository = container.get<CourseRepository>(
        Register.content.repository.CourseRepository
      );
      const podcastRepository = container.get<PodcastRepository>(
        Register.podcast.repository.PodcastRepository
      );
      const trailRepository = container.get<TrailRepository>(
        Register.content.repository.TrailRepository
      );
      
      return new SearchRepositoryImpl(courseRepository, podcastRepository, trailRepository);
    })
    .inSingletonScope();

  // Use Cases
  container.bind<GlobalSearchUseCase>(Register.search.useCase.GlobalSearchUseCase)
    .toDynamicValue(() => {
      const searchRepository = container.get<SearchRepository>(
        Register.search.repository.SearchRepository
      );
      
      return new GlobalSearchUseCase(searchRepository);
    })
    .inSingletonScope();
}
