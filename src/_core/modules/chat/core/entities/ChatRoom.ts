interface ChatRoomProps {
  id?: string;
  classId: string;
  courseId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ChatRoom {
  private readonly _id: string;
  private readonly _classId: string;
  private readonly _courseId: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ChatRoomProps) {
    this._id = props.id ?? crypto.randomUUID();
    this._classId = props.classId;
    this._courseId = props.courseId;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: Omit<ChatRoomProps, "createdAt" | "updatedAt">
  ): ChatRoom {
    return new ChatRoom(props);
  }

  public static from(props: ChatRoomProps): ChatRoom {
    return new ChatRoom(props);
  }

  public get id(): string {
    return this._id;
  }

  public get classId(): string {
    return this._classId;
  }

  public get courseId(): string {
    return this._courseId;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
