export class CreateChatRoomForClassInput {
  constructor(
    public readonly classId: string,
    public readonly courseId: string
  ) {}
}
