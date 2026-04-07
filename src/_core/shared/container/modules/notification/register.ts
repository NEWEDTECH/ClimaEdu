import { Container } from 'inversify'
import { repositories, useCases } from './symbols'

import type { NotificationRepository } from '@/_core/modules/notification/infrastructure/repositories/NotificationRepository'
import { FirebaseNotificationRepository } from '@/_core/modules/notification/infrastructure/repositories/implementations/FirebaseNotificationRepository'

import { CreateNotificationUseCase } from '@/_core/modules/notification/core/use-cases/create-notification/create-notification.use-case'
import { RespondToNotificationUseCase } from '@/_core/modules/notification/core/use-cases/respond-to-notification/respond-to-notification.use-case'
import { MarkNotificationReadUseCase } from '@/_core/modules/notification/core/use-cases/mark-notification-read/mark-notification-read.use-case'

export function registerNotificationModule(container: Container): void {
  container.bind<NotificationRepository>(repositories.NotificationRepository).to(FirebaseNotificationRepository)

  container.bind(useCases.CreateNotificationUseCase).to(CreateNotificationUseCase)
  container.bind(useCases.RespondToNotificationUseCase).to(RespondToNotificationUseCase)
  container.bind(useCases.MarkNotificationReadUseCase).to(MarkNotificationReadUseCase)
}
