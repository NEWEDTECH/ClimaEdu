import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { ChatRoom } from "../../entities/ChatRoom";
import { ChatSymbols } from "../../../../../shared/container/modules/chat/symbols";
import type { ChatRoomRepository } from "../../../infrastructure/repositories/ChatRoomRepository";
import { CreateChatRoomForClassInput } from "./create-chat-room-for-class.input";
import { CreateChatRoomForClassOutput } from "./create-chat-room-for-class.output";

@injectable()
export class CreateChatRoomForClassUseCase {
  constructor(
    @inject(ChatSymbols.repositories.ChatRoomRepository)
    private readonly chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(
    input: CreateChatRoomForClassInput
  ): Promise<CreateChatRoomForClassOutput> {
    const existingChatRoom =
      await this.chatRoomRepository.findByClassAndCourse(
        input.classId,
        input.courseId
      );

    if (existingChatRoom) {
      throw new AppError("Chat room for this class and course already exists");
    }

    const id = await this.chatRoomRepository.generateId();

    const chatRoom = ChatRoom.create({
      id,
      classId: input.classId,
      courseId: input.courseId,
    });

    await this.chatRoomRepository.save(chatRoom);

    return new CreateChatRoomForClassOutput(chatRoom);
  }
}
