import { ChatRoom } from "../../core/entities/ChatRoom";
import { ChatMessage } from "../../core/entities/ChatMessage";
import { ChatParticipant } from "../../core/entities/ChatParticipant";

export interface ChatRoomRepository {
  generateId(): Promise<string>;
  save(chatRoom: ChatRoom): Promise<void>;
  findById(id: string): Promise<ChatRoom | null>;
  findByClassAndCourse(
    classId: string,
    courseId: string
  ): Promise<ChatRoom | null>;
  addMessage(chatRoomId: string, message: ChatMessage): Promise<void>;
  addParticipant(chatRoomId: string, participant: ChatParticipant): Promise<void>;
  removeParticipant(chatRoomId: string, userId: string): Promise<void>;
  getMessages(chatRoomId: string): Promise<ChatMessage[]>;
  getParticipants(chatRoomId: string): Promise<ChatParticipant[]>;
  subscribeToMessages(
    chatRoomId: string,
    onMessagesUpdate: (messages: ChatMessage[]) => void
  ): () => void;
}
