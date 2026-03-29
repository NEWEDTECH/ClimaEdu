export const repositories = {
  NotificationRepository: Symbol.for('NotificationRepository'),
}

export const useCases = {
  CreateNotificationUseCase: Symbol.for('CreateNotificationUseCase'),
  RespondToNotificationUseCase: Symbol.for('RespondToNotificationUseCase'),
  MarkNotificationReadUseCase: Symbol.for('MarkNotificationReadUseCase'),
}

export const NotificationSymbols = {
  repositories,
  useCases,
}
