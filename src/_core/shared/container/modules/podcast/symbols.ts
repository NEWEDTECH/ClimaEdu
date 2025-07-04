// Podcast module symbols
export const repositories = {
  PodcastRepository: Symbol.for('PodcastRepository'),
  PodcastViewRepository: Symbol.for('PodcastViewRepository'),
  PodcastLikeRepository: Symbol.for('PodcastLikeRepository'),
};

export const useCases = {
  // Gestão de Podcasts
  CreatePodcastUseCase: Symbol.for('CreatePodcastUseCase'),
  UpdatePodcastUseCase: Symbol.for('UpdatePodcastUseCase'),
  DeletePodcastUseCase: Symbol.for('DeletePodcastUseCase'),
  ListPodcastsUseCase: Symbol.for('ListPodcastsUseCase'),
  GetPodcastUseCase: Symbol.for('GetPodcastUseCase'),
  
  // Monitoramento
  AddViewToPodcastUseCase: Symbol.for('AddViewToPodcastUseCase'),
  ToggleLikePodcastUseCase: Symbol.for('ToggleLikePodcastUseCase'),
  GetPodcastAnalyticsUseCase: Symbol.for('GetPodcastAnalyticsUseCase'),
};

// Export all symbols for this module
export const PodcastSymbols = {
  repositories,
  useCases,
};
