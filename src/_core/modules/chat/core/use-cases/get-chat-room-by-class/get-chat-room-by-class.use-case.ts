import { inject, injectable } from "inversify";
import { ChatSymbols } from "../../../../../shared/container/modules/chat/symbols";
import type { ChatRoomRepository } from "../../../infrastructure/repositories/ChatRoomRepository";
import { GetChatRoomByClassInput } from "./get-chat-room-by-class.input";
import { GetChatRoomByClassOutput } from "./get-chat-room-by-class.output";

@injectable()
export class GetChatRoomByClassUseCase {
  constructor(
    @inject(ChatSymbols.repositories.ChatRoomRepository)
    private readonly chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(
    input: GetChatRoomByClassInput
  ): Promise<GetChatRoomByClassOutput> {
    const chatRoom = await this.chatRoomRepository.findByClassAndCourse(
      input.classId,
      input.courseId
    );
    return new GetChatRoomByClassOutput(chatRoom);
  }
}
