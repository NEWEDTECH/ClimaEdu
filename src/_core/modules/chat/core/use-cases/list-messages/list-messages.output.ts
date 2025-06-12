import { ChatMessage } from "../../entities/ChatMessage";

export class ListMessagesOutput {
  constructor(public readonly messages: ChatMessage[]) {}
}
