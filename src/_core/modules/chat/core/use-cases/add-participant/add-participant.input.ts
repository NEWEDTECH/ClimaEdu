export class AddParticipantInput {
  constructor(
    public readonly chatRoomId: string,
    public readonly userId: string
  ) {}
}
