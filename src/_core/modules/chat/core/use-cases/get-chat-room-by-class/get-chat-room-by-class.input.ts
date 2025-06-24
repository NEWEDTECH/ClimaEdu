export class GetChatRoomByClassInput {
  constructor(
    public readonly classId: string,
    public readonly courseId: string
  ) {}
}
