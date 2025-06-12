export class RemoveParticipantInput {
  constructor(
    public readonly chatRoomId: string,
    public readonly userId: string
  ) {}
}
