import type { Notification } from '../../entities/Notification'

export class CreateNotificationOutput {
  constructor(public readonly notification: Notification) {}
}
