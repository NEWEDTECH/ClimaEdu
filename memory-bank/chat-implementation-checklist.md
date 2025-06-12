### Implementation Checklist: Chat

#### Módulo `chat`
- [x] **Estrutura de Pastas:** Criar a estrutura de pastas para o novo módulo `chat` em `src/_core/modules/chat`.
- [x] **Entidades:**
    - [x] Criar entidade `ChatRoom` (`.../chat/core/entities/ChatRoom.ts`)
    - [x] Criar entidade `ChatMessage` (`.../chat/core/entities/ChatMessage.ts`)
    - [x] Criar entidade `ChatParticipant` (`.../chat/core/entities/ChatParticipant.ts`)
- [ ] **Repositório:**
    - [x] Criar interface `ChatRoomRepository`
    - [x] Criar implementação `FirebaseChatRoomRepository` (que irá gerenciar o documento `ChatRoom` com mensagens e participantes aninhados).
- [ ] **Casos de Uso (Use Cases):**
    - [x] `CreateChatRoomForClassUseCase`
    - [x] `SendMessageUseCase`
    - [x] `ListMessagesUseCase`
    - [x] `AddParticipantUseCase`
    - [x] `RemoveParticipantUseCase`
    - [x] `GetChatRoomByClassUseCase`
- [x] **Injeção de Dependência (DI):**
    - [x] Criar `symbols.ts` para o módulo `chat`.
    - [x] Criar `register.ts` para registrar os novos componentes no container de DI.

#### Documentação
- [x] Criar `docs/bounded-contexts/chat.md` com a documentação do novo contexto delimitado.
- [x] Atualizar `memory-bank/domainModel.md` com as novas entidades.
