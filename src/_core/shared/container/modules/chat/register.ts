import { Container } from 'inversify';
import { useCases, repositories } from './symbols';

// Import implementations
import type { ChatRoomRepository } from '@/_core/modules/chat/infrastructure/repositories/ChatRoomRepository';
import { FirebaseChatRoomRepository } from '@/_core/modules/chat/infrastructure/repositories/implementations/FirebaseChatRoomRepository';
import { CreateChatRoomForClassUseCase } from '@/_core/modules/chat/core/use-cases/create-chat-room-for-class/create-chat-room-for-class.use-case';
import { SendMessageUseCase } from '@/_core/modules/chat/core/use-cases/send-message/send-message.use-case';
import { ListMessagesUseCase } from '@/_core/modules/chat/core/use-cases/list-messages/list-messages.use-case';
import { AddParticipantUseCase } from '@/_core/modules/chat/core/use-cases/add-participant/add-participant.use-case';
import { RemoveParticipantUseCase } from '@/_core/modules/chat/core/use-cases/remove-participant/remove-participant.use-case';
import { GetChatRoomByClassUseCase } from '@/_core/modules/chat/core/use-cases/get-chat-room-by-class/get-chat-room-by-class.use-case';

/**
 * Register Chat module dependencies
 * @param container The DI container
 */
export function registerChatModule(container: Container): void {
  // Register repositories
  container.bind<ChatRoomRepository>(repositories.ChatRoomRepository).to(FirebaseChatRoomRepository);
  
  // Register use cases
  container.bind(useCases.CreateChatRoomForClassUseCase).to(CreateChatRoomForClassUseCase);
  container.bind(useCases.SendMessageUseCase).to(SendMessageUseCase);
  container.bind(useCases.ListMessagesUseCase).to(ListMessagesUseCase);
  container.bind(useCases.AddParticipantUseCase).to(AddParticipantUseCase);
  container.bind(useCases.RemoveParticipantUseCase).to(RemoveParticipantUseCase);
  container.bind(useCases.GetChatRoomByClassUseCase).to(GetChatRoomByClassUseCase);
}
