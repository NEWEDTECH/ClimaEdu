export type NotificationType = 'TUTORING_SCHEDULED' | 'TUTORING_RESPONDED'

export class Notification {
  constructor(
    readonly id: string,
    readonly recipientId: string,
    readonly senderId: string,
    readonly senderName: string,
    readonly type: NotificationType,
    readonly title: string,
    readonly message: string,
    public read: boolean,
    readonly relatedEntityId: string,
    public response: string | null,
    readonly createdAt: Date
  ) {}

  static create(params: {
    id: string
    recipientId: string
    senderId: string
    senderName: string
    type: NotificationType
    title: string
    message: string
    relatedEntityId: string
  }): Notification {
    return new Notification(
      params.id,
      params.recipientId,
      params.senderId,
      params.senderName,
      params.type,
      params.title,
      params.message,
      false,
      params.relatedEntityId,
      null,
      new Date()
    )
  }

  markAsRead(): void {
    this.read = true
  }

  setResponse(text: string): void {
    this.response = text
    this.read = true
  }
}
