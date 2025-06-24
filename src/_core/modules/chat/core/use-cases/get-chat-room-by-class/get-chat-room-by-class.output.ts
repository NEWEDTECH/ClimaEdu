import { ChatRoom } from "../../entities/ChatRoom";

export class GetChatRoomByClassOutput {
  constructor(public readonly chatRoom: ChatRoom | null) {}
}
