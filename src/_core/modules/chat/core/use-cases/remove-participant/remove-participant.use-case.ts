import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ChatSymbols } from "../../../../../shared/container/modules/chat/symbols";
import type { ChatRoomRepository } from "../../../infrastructure/repositories/ChatRoomRepository";
import { RemoveParticipantInput } from "./remove-participant.input";
import { RemoveParticipantOutput } from "./remove-participant.output";

@injectable()
export class RemoveParticipantUseCase {
  constructor(
    @inject(ChatSymbols.repositories.ChatRoomRepository)
    private readonly chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(
    input: RemoveParticipantInput
  ): Promise<RemoveParticipantOutput> {
    const chatRoom = await this.chatRoomRepository.findById(input.chatRoomId);

    if (!chatRoom) {
      throw new AppError("Chat room not found", 404);
    }

    const participants = await this.chatRoomRepository.getParticipants(
      input.chatRoomId
    );

    if (!participants.some((p) => p.userId === input.userId)) {
      throw new AppError("User is not a participant of this chat room");
    }

    await this.chatRoomRepository.removeParticipant(
      input.chatRoomId,
      input.userId
    );

    return new RemoveParticipantOutput(true);
  }
}
