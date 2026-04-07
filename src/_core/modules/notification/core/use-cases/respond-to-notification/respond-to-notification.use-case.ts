import { injectable, inject } from 'inversify'
import { NotificationSymbols } from '../../../../../shared/container/modules/notification/symbols'
import type { NotificationRepository } from '../../../infrastructure/repositories/NotificationRepository'
import { Notification } from '../../entities/Notification'
import { RespondToNotificationInput } from './respond-to-notification.input'
import { RespondToNotificationOutput } from './respond-to-notification.output'

@injectable()
export class RespondToNotificationUseCase {
  constructor(
    @inject(NotificationSymbols.repositories.NotificationRepository)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(input: RespondToNotificationInput): Promise<RespondToNotificationOutput> {
    const original = await this.notificationRepository.findById(input.notificationId)
    if (!original) throw new Error(`Notification not found: ${input.notificationId}`)

    original.setResponse(input.responseText)
    await this.notificationRepository.save(original)

    // Create a new notification for the original sender (student)
    const replyId = await this.notificationRepository.generateId()
    const replyNotification = Notification.create({
      id: replyId,
      recipientId: original.senderId,
      senderId: original.recipientId,
      senderName: input.responderName,
      type: 'TUTORING_RESPONDED',
      title: 'Tutor respondeu sua tutoria',
      message: input.responseText,
      relatedEntityId: original.relatedEntityId
    })
    await this.notificationRepository.save(replyNotification)

    return new RespondToNotificationOutput(true)
  }
}
