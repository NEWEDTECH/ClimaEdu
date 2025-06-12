import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ChatParticipant } from "../../entities/ChatParticipant";
import { ChatSymbols } from "../../../../../shared/container/modules/chat/symbols";
import type { ChatRoomRepository } from "../../../infrastructure/repositories/ChatRoomRepository";
import { AddParticipantInput } from "./add-participant.input";
import { AddParticipantOutput } from "./add-participant.output";

@injectable()
export class AddParticipantUseCase {
  constructor(
    @inject(ChatSymbols.repositories.ChatRoomRepository)
    private readonly chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(
    input: AddParticipantInput
  ): Promise<AddParticipantOutput> {
    const chatRoom = await this.chatRoomRepository.findById(input.chatRoomId);

    if (!chatRoom) {
      throw new AppError("Chat room not found", 404);
    }

    const participants = await this.chatRoomRepository.getParticipants(
      input.chatRoomId
    );

    if (participants.some((p) => p.userId === input.userId)) {
      throw new AppError("User is already a participant of this chat room");
    }

    const participant = ChatParticipant.create({
      chatRoomId: input.chatRoomId,
      userId: input.userId,
    });

    await this.chatRoomRepository.addParticipant(input.chatRoomId, participant);

    return new AddParticipantOutput(participant);
  }
}
