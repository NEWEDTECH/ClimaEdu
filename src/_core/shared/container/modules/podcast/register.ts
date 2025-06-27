import { Container } from 'inversify';
import { repositories, useCases } from './symbols';

// Import repository interfaces
import type { PodcastRepository } from '@/_core/modules/podcast/infrastructure/repositories/PodcastRepository';
import type { PodcastViewRepository } from '@/_core/modules/podcast/infrastructure/repositories/PodcastViewRepository';
import type { PodcastLikeRepository } from '@/_core/modules/podcast/infrastructure/repositories/PodcastLikeRepository';

// Import repository implementations
import { FirebasePodcastRepository } from '@/_core/modules/podcast/infrastructure/repositories/implementations/FirebasePodcastRepository';
import { FirebasePodcastViewRepository } from '@/_core/modules/podcast/infrastructure/repositories/implementations/FirebasePodcastViewRepository';
import { FirebasePodcastLikeRepository } from '@/_core/modules/podcast/infrastructure/repositories/implementations/FirebasePodcastLikeRepository';

// Import use cases
import { CreatePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/create-podcast/create-podcast.use-case';
import { UpdatePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/update-podcast/update-podcast.use-case';
import { DeletePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/delete-podcast/delete-podcast.use-case';
import { ListPodcastsUseCase } from '@/_core/modules/podcast/core/use-cases/list-podcasts/list-podcasts.use-case';
import { GetPodcastUseCase } from '@/_core/modules/podcast/core/use-cases/get-podcast/get-podcast.use-case';
import { AddViewToPodcastUseCase } from '@/_core/modules/podcast/core/use-cases/add-view-to-podcast/add-view-to-podcast.use-case';
import { ToggleLikePodcastUseCase } from '@/_core/modules/podcast/core/use-cases/toggle-like-podcast/toggle-like-podcast.use-case';
import { GetPodcastAnalyticsUseCase } from '@/_core/modules/podcast/core/use-cases/get-podcast-analytics/get-podcast-analytics.use-case';

/**
 * Register Podcast module dependencies
 * @param container The DI container
 */
export function registerPodcastModule(container: Container): void {
  // Register repositories
  container.bind<PodcastRepository>(repositories.PodcastRepository).to(FirebasePodcastRepository);
  container.bind<PodcastViewRepository>(repositories.PodcastViewRepository).to(FirebasePodcastViewRepository);
  container.bind<PodcastLikeRepository>(repositories.PodcastLikeRepository).to(FirebasePodcastLikeRepository);
  
  // Register use cases - Gestão
  container.bind(useCases.CreatePodcastUseCase).to(CreatePodcastUseCase);
  container.bind(useCases.UpdatePodcastUseCase).to(UpdatePodcastUseCase);
  container.bind(useCases.DeletePodcastUseCase).to(DeletePodcastUseCase);
  container.bind(useCases.ListPodcastsUseCase).to(ListPodcastsUseCase);
  container.bind(useCases.GetPodcastUseCase).to(GetPodcastUseCase);
  
  // Register use cases - Monitoramento
  container.bind(useCases.AddViewToPodcastUseCase).to(AddViewToPodcastUseCase);
  container.bind(useCases.ToggleLikePodcastUseCase).to(ToggleLikePodcastUseCase);
  container.bind(useCases.GetPodcastAnalyticsUseCase).to(GetPodcastAnalyticsUseCase);
}
