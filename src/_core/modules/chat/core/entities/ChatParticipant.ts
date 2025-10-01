
interface ChatParticipantProps {
  id?: string;
  chatRoomId: string;
  userId: string;
  joinedAt?: Date;
}

export class ChatParticipant {
  private readonly _id: string;
  private readonly _chatRoomId: string;
  private readonly _userId: string;
  private readonly _joinedAt: Date;

  private constructor(props: ChatParticipantProps) {
    this._id = props.id ?? crypto.randomUUID();
    this._chatRoomId = props.chatRoomId;
    this._userId = props.userId;
    this._joinedAt = props.joinedAt ?? new Date();
  }

  public static create(
    props: Omit<ChatParticipantProps, "id" | "joinedAt">
  ): ChatParticipant {
    return new ChatParticipant(props);
  }

  public static from(props: ChatParticipantProps): ChatParticipant {
    return new ChatParticipant(props);
  }

  public get id(): string {
    return this._id;
  }

  public get chatRoomId(): string {
    return this._chatRoomId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get joinedAt(): Date {
    return this._joinedAt;
  }
}
