import { injectable, inject } from 'inversify'
import { NotificationSymbols } from '../../../../../shared/container/modules/notification/symbols'
import type { NotificationRepository } from '../../../infrastructure/repositories/NotificationRepository'
import { MarkNotificationReadInput } from './mark-notification-read.input'
import { MarkNotificationReadOutput } from './mark-notification-read.output'

@injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @inject(NotificationSymbols.repositories.NotificationRepository)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(input: MarkNotificationReadInput): Promise<MarkNotificationReadOutput> {
    const notification = await this.notificationRepository.findById(input.notificationId)
    if (!notification) return new MarkNotificationReadOutput(false)

    notification.markAsRead()
    await this.notificationRepository.save(notification)
    return new MarkNotificationReadOutput(true)
  }
}
