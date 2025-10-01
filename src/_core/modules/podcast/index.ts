// This file serves as the public API for the Podcast module

// Re-export entities
export * from './core/entities/Podcast';
export * from './core/entities/PodcastView';
export * from './core/entities/PodcastLike';
export * from './core/entities/PodcastMediaType';

// Re-export use cases - Gestão
export * from './core/use-cases/create-podcast/create-podcast.use-case';
export * from './core/use-cases/create-podcast/create-podcast.input';
export * from './core/use-cases/create-podcast/create-podcast.output';
export * from './core/use-cases/update-podcast/update-podcast.use-case';
export * from './core/use-cases/update-podcast/update-podcast.input';
export * from './core/use-cases/update-podcast/update-podcast.output';
export * from './core/use-cases/delete-podcast/delete-podcast.use-case';
export * from './core/use-cases/delete-podcast/delete-podcast.input';
export * from './core/use-cases/delete-podcast/delete-podcast.output';
export * from './core/use-cases/list-podcasts/list-podcasts.use-case';
export * from './core/use-cases/list-podcasts/list-podcasts.input';
export * from './core/use-cases/list-podcasts/list-podcasts.output';
export * from './core/use-cases/get-podcast/get-podcast.use-case';
export * from './core/use-cases/get-podcast/get-podcast.input';
export * from './core/use-cases/get-podcast/get-podcast.output';

// Re-export use cases - Monitoramento
export * from './core/use-cases/add-view-to-podcast/add-view-to-podcast.use-case';
export * from './core/use-cases/add-view-to-podcast/add-view-to-podcast.input';
export * from './core/use-cases/add-view-to-podcast/add-view-to-podcast.output';
export * from './core/use-cases/toggle-like-podcast/toggle-like-podcast.use-case';
export * from './core/use-cases/toggle-like-podcast/toggle-like-podcast.input';
export * from './core/use-cases/toggle-like-podcast/toggle-like-podcast.output';
export * from './core/use-cases/get-podcast-analytics/get-podcast-analytics.use-case';
export * from './core/use-cases/get-podcast-analytics/get-podcast-analytics.input';
export * from './core/use-cases/get-podcast-analytics/get-podcast-analytics.output';

// Re-export repository interfaces
export * from './infrastructure/repositories/PodcastRepository';
export type { 
  PodcastViewRepository, 
  AnalyticsTimeRange, 
  ViewsOverTime, 
  PaginationOptions 
} from './infrastructure/repositories/PodcastViewRepository';
export type { 
  PodcastLikeRepository, 
  LikesOverTime, 
  TopLikedPodcast 
} from './infrastructure/repositories/PodcastLikeRepository';

// Re-export repository implementations
export * from './infrastructure/repositories/implementations/FirebasePodcastRepository';
export * from './infrastructure/repositories/implementations/FirebasePodcastViewRepository';
export * from './infrastructure/repositories/implementations/FirebasePodcastLikeRepository';
