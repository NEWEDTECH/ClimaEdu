import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ChatMessage } from "../../entities/ChatMessage";
import { ChatSymbols } from "../../../../../shared/container/modules/chat/symbols";
import type { ChatRoomRepository } from "../../../infrastructure/repositories/ChatRoomRepository";
import { SendMessageInput } from "./send-message.input";
import { SendMessageOutput } from "./send-message.output";

@injectable()
export class SendMessageUseCase {
  constructor(
    @inject(ChatSymbols.repositories.ChatRoomRepository)
    private readonly chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const chatRoom = await this.chatRoomRepository.findById(input.chatRoomId);

    if (!chatRoom) {
      throw new AppError("Chat room not found", 404);
    }

    const participants = await this.chatRoomRepository.getParticipants(
      input.chatRoomId
    );

    if (!participants.some((p) => p.userId === input.userId)) {
      throw new AppError("User is not a participant of this chat room", 403);
    }

    const message = ChatMessage.create({
      chatRoomId: input.chatRoomId,
      userId: input.userId,
      text: input.text,
    });

    await this.chatRoomRepository.addMessage(input.chatRoomId, message);

    return new SendMessageOutput(message);
  }
}
