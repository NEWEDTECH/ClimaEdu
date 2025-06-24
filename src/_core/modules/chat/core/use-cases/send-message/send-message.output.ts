import { ChatMessage } from "../../entities/ChatMessage";

export class SendMessageOutput {
  constructor(public readonly message: ChatMessage) {}
}
