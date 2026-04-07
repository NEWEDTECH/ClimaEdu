import { injectable, inject } from 'inversify'
import { NotificationSymbols } from '../../../../../shared/container/modules/notification/symbols'
import type { NotificationRepository } from '../../../infrastructure/repositories/NotificationRepository'
import { Notification } from '../../entities/Notification'
import { CreateNotificationInput } from './create-notification.input'
import { CreateNotificationOutput } from './create-notification.output'

@injectable()
export class CreateNotificationUseCase {
  constructor(
    @inject(NotificationSymbols.repositories.NotificationRepository)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(input: CreateNotificationInput): Promise<CreateNotificationOutput> {
    const id = await this.notificationRepository.generateId()
    const notification = Notification.create({
      id,
      recipientId: input.recipientId,
      senderId: input.senderId,
      senderName: input.senderName,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedEntityId: input.relatedEntityId
    })
    const saved = await this.notificationRepository.save(notification)
    return new CreateNotificationOutput(saved)
  }
}
