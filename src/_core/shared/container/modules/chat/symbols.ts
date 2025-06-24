// Chat module symbols
export const repositories = {
  ChatRoomRepository: Symbol.for('ChatRoomRepository'),
};

export const useCases = {
  CreateChatRoomForClassUseCase: Symbol.for('CreateChatRoomForClassUseCase'),
  SendMessageUseCase: Symbol.for('SendMessageUseCase'),
  ListMessagesUseCase: Symbol.for('ListMessagesUseCase'),
  AddParticipantUseCase: Symbol.for('AddParticipantUseCase'),
  RemoveParticipantUseCase: Symbol.for('RemoveParticipantUseCase'),
  GetChatRoomByClassUseCase: Symbol.for('GetChatRoomByClassUseCase'),
};

// Export all symbols for this module
export const ChatSymbols = {
  repositories,
  useCases,
};
