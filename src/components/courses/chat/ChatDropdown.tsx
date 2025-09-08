'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { useProfile } from '@/context/zustand/useProfile';
import { GetChatRoomByClassUseCase } from '@/_core/modules/chat/core/use-cases/get-chat-room-by-class/get-chat-room-by-class.use-case';
import { GetChatRoomByClassInput } from '@/_core/modules/chat/core/use-cases/get-chat-room-by-class/get-chat-room-by-class.input';
import { CreateChatRoomForClassUseCase } from '@/_core/modules/chat/core/use-cases/create-chat-room-for-class/create-chat-room-for-class.use-case';
import { CreateChatRoomForClassInput } from '@/_core/modules/chat/core/use-cases/create-chat-room-for-class/create-chat-room-for-class.input';
import { SendMessageUseCase } from '@/_core/modules/chat/core/use-cases/send-message/send-message.use-case';
import { SendMessageInput } from '@/_core/modules/chat/core/use-cases/send-message/send-message.input';
import { AddParticipantUseCase } from '@/_core/modules/chat/core/use-cases/add-participant/add-participant.use-case';
import { AddParticipantInput } from '@/_core/modules/chat/core/use-cases/add-participant/add-participant.input';
import { ChatRoom } from '@/_core/modules/chat/core/entities/ChatRoom';
import { ChatMessage } from '@/_core/modules/chat/core/entities/ChatMessage';
import { ChatRoomRepository } from '@/_core/modules/chat/infrastructure/repositories/ChatRoomRepository';

type ChatDropdownProps = {
  courseId: string;
  classId: string;
  userId: string;
  userName: string;
  isEmbedded?: boolean;
}

export function ChatDropdown({ courseId, classId, userId, isEmbedded = false }: ChatDropdownProps) {
  const { infoUser } = useProfile();
  const [isOpen] = useState<boolean>(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const subscribeToMessages = useCallback((chatRoomId: string) => {
    try {
      const chatRoomRepository = container.get<ChatRoomRepository>(
        Register.chat.repository.ChatRoomRepository
      );

      const unsubscribe = chatRoomRepository.subscribeToMessages(
        chatRoomId,
        (newMessages: ChatMessage[]) => {
          setMessages(newMessages);
          setTimeout(scrollToBottom, 100);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return () => { };
    }
  }, []);

  const initializeChatRoom = useCallback(async () => {
    if (!courseId || !classId || !userId) return;

    setIsInitializing(true);
    try {
      // First, try to get existing chat room
      const getChatRoomUseCase = container.get<GetChatRoomByClassUseCase>(
        Register.chat.useCase.GetChatRoomByClassUseCase
      );

      const getChatRoomInput = new GetChatRoomByClassInput(classId, courseId);
      const getChatRoomOutput = await getChatRoomUseCase.execute(getChatRoomInput);

      let currentChatRoom = getChatRoomOutput.chatRoom;

      // If no chat room exists, create one
      if (!currentChatRoom) {
        const createChatRoomUseCase = container.get<CreateChatRoomForClassUseCase>(
          Register.chat.useCase.CreateChatRoomForClassUseCase
        );

        const createChatRoomInput = new CreateChatRoomForClassInput(classId, courseId);
        const createChatRoomOutput = await createChatRoomUseCase.execute(createChatRoomInput);
        currentChatRoom = createChatRoomOutput.chatRoom;
      }

      // Always try to add current user as participant (whether chat room is new or existing)
      try {
        const addParticipantUseCase = container.get<AddParticipantUseCase>(
          Register.chat.useCase.AddParticipantUseCase
        );

        const addParticipantInput = new AddParticipantInput(currentChatRoom.id, userId);
        await addParticipantUseCase.execute(addParticipantInput);
      } catch (participantError) {
        // User might already be a participant, which is fine
        console.log('User might already be a participant:', participantError);
      }

      setChatRoom(currentChatRoom);
      // Subscribe to real-time messages
      const unsubscribe = subscribeToMessages(currentChatRoom.id);

      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing chat room:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [courseId, classId, userId, subscribeToMessages]);

  const ensureUserIsParticipant = async (chatRoomId: string) => {
    try {
      const addParticipantUseCase = container.get<AddParticipantUseCase>(
        Register.chat.useCase.AddParticipantUseCase
      );

      const addParticipantInput = new AddParticipantInput(chatRoomId, userId);
      await addParticipantUseCase.execute(addParticipantInput);
    } catch (error) {
      // User might already be a participant, which is fine
      console.log('User might already be a participant:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    // Store the message text and clear input immediately for better UX
    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      let currentChatRoom = chatRoom;

      // If no chat room exists, initialize it first
      if (!currentChatRoom) {
        // Get or create chat room
        const getChatRoomUseCase = container.get<GetChatRoomByClassUseCase>(
          Register.chat.useCase.GetChatRoomByClassUseCase
        );

        const getChatRoomInput = new GetChatRoomByClassInput(classId, courseId);
        const getChatRoomOutput = await getChatRoomUseCase.execute(getChatRoomInput);

        currentChatRoom = getChatRoomOutput.chatRoom;

        // If still no chat room, create one
        if (!currentChatRoom) {
          const createChatRoomUseCase = container.get<CreateChatRoomForClassUseCase>(
            Register.chat.useCase.CreateChatRoomForClassUseCase
          );

          const createChatRoomInput = new CreateChatRoomForClassInput(classId, courseId);
          const createChatRoomOutput = await createChatRoomUseCase.execute(createChatRoomInput);
          currentChatRoom = createChatRoomOutput.chatRoom;
        }

        // Update state with the chat room
        setChatRoom(currentChatRoom);
      }

      // Ensure user is a participant before sending message
      await ensureUserIsParticipant(currentChatRoom.id);

      // Now send the message using the stored text
      const sendMessageUseCase = container.get<SendMessageUseCase>(
        Register.chat.useCase.SendMessageUseCase
      );

      const sendMessageInput = new SendMessageInput(currentChatRoom.id, userId, infoUser.name || 'Usuário', messageText);
      await sendMessageUseCase.execute(sendMessageInput);

      // Message will be added via the real-time listener
    } catch (error) {
      console.error('Error sending message:', error);
      // If there's an error, restore the message text
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if ((isOpen || isEmbedded) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isEmbedded]);

  useEffect(() => {
    if (isEmbedded && !chatRoom) {
      initializeChatRoom().then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribeRef.current = unsubscribe;
        }
      });
    }
  }, [isEmbedded, chatRoom, initializeChatRoom]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Subscribe to messages when chatRoom changes
  useEffect(() => {
    if (chatRoom && !unsubscribeRef.current) {
      const unsubscribe = subscribeToMessages(chatRoom.id);
      unsubscribeRef.current = unsubscribe;
    }
  }, [chatRoom, subscribeToMessages]);

  const formatTime = (date: Date) => {
    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
      return '--:--';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Data inválida';
    }

    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(messageDate);
  };

  return (
    <>
      {isEmbedded && (
        <div className="h-full flex flex-col bg-red-600" style={{ height: 'calc(100vh - 11.5rem)' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isInitializing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">Carregando chat...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-500 text-center">Nenhuma mensagem ainda.<br />Seja o primeiro a conversar!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.userId === userId;
                const showDate = index === 0 ||
                  formatDate(messages[index - 1].sentAt) !== formatDate(message.sentAt);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex justify-center mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {formatDate(message.sentAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${isOwnMessage
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {message.userName}
                          </p>
                        )}
                        <p className="break-words">{message.text}</p>
                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading || isInitializing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
