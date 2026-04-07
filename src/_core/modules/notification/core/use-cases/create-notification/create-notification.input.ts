import type { NotificationType } from '../../entities/Notification'

export class CreateNotificationInput {
  constructor(
    public readonly recipientId: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly relatedEntityId: string
  ) {}
}
