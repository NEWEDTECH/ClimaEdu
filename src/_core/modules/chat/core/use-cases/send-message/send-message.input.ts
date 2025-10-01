export class SendMessageInput {
  constructor(
    public readonly chatRoomId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly text: string
  ) {}
}
