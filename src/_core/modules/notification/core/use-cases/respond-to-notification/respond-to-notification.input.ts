export class RespondToNotificationInput {
  constructor(
    public readonly notificationId: string,
    public readonly responderName: string,
    public readonly responseText: string
  ) {}
}
