import type { Notification } from '../../core/entities/Notification'

export type Unsubscribe = () => void

export interface NotificationRepository {
  generateId(): Promise<string>
  save(notification: Notification): Promise<Notification>
  findById(id: string): Promise<Notification | null>
  subscribeByRecipient(
    recipientId: string,
    onUpdate: (notifications: Notification[]) => void
  ): Unsubscribe
}
