import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ChatSymbols } from "../../../../../shared/container/modules/chat/symbols";
import type { ChatRoomRepository } from "../../../infrastructure/repositories/ChatRoomRepository";
import { ListMessagesInput } from "./list-messages.input";
import { ListMessagesOutput } from "./list-messages.output";

@injectable()
export class ListMessagesUseCase {
  constructor(
    @inject(ChatSymbols.repositories.ChatRoomRepository)
    private readonly chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(input: ListMessagesInput): Promise<ListMessagesOutput> {
    const chatRoom = await this.chatRoomRepository.findById(input.chatRoomId);

    if (!chatRoom) {
      throw new AppError("Chat room not found", 404);
    }

    const messages = await this.chatRoomRepository.getMessages(input.chatRoomId);

    return new ListMessagesOutput(messages);
  }
}
