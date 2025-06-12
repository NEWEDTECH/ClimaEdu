import { randomUUID } from "crypto";

interface ChatMessageProps {
  id?: string;
  chatRoomId: string;
  userId: string;
  text: string;
  sentAt?: Date;
}

export class ChatMessage {
  private readonly _id: string;
  private readonly _chatRoomId: string;
  private readonly _userId: string;
  private _text: string;
  private readonly _sentAt: Date;

  private constructor(props: ChatMessageProps) {
    this._id = props.id ?? randomUUID();
    this._chatRoomId = props.chatRoomId;
    this._userId = props.userId;
    this._text = props.text;
    this._sentAt = props.sentAt ?? new Date();
  }

  public static create(props: Omit<ChatMessageProps, "id" | "sentAt">): ChatMessage {
    return new ChatMessage(props);
  }

  public static from(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props);
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

  public get text(): string {
    return this._text;
  }

  public get sentAt(): Date {
    return this._sentAt;
  }
}
