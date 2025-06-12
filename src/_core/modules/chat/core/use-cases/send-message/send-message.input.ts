export class SendMessageInput {
  constructor(
    public readonly chatRoomId: string,
    public readonly userId: string,
    public readonly text: string
  ) {}
}
