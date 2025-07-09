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
- [x] **Casos de Uso (Use Cases):**
    - [x] `CreateChatRoomForClassUseCase`
    - [x] `SendMessageUseCase`
    - [x] `ListMessagesUseCase`
    - [x] `AddParticipantUseCase` - **CORRIGIDO**: Agora é idempotente, não lança erro se usuário já é participante
    - [x] `RemoveParticipantUseCase`
    - [x] `GetChatRoomByClassUseCase`
- [x] **Injeção de Dependência (DI):**
    - [x] Criar `symbols.ts` para o módulo `chat`.
    - [x] Criar `register.ts` para registrar os novos componentes no container de DI.

#### Frontend
- [x] **ChatDropdown Component** - **CORRIGIDO**: 
    - [x] Corrigido fluxo de envio de mensagens para garantir que usuário seja participante
    - [x] Adicionada função `ensureUserIsParticipant` para verificar participação antes de enviar mensagem
    - [x] Melhorada lógica de inicialização do chat room na função `sendMessage`

#### Bugs Corrigidos
- [x] **randomUUID Error**: Erro do `crypto.randomUUID` no browser foi resolvido pelo usuário
- [x] **User not participant Error**: Corrigido fluxo para garantir que usuário seja adicionado como participante antes de enviar mensagens
- [x] **AddParticipantUseCase**: Tornado idempotente para não falhar quando usuário já é participante
- [x] **Invalid Date Error**: Corrigido erro "Invalid time value" nas funções formatDate/formatTime
  - Adicionada validação de datas no ChatDropdown.tsx
  - Corrigida conversão de Timestamps do Firestore para Date no FirebaseChatRoomRepository
  - Métodos getMessages e getParticipants agora convertem corretamente Timestamps para objetos Date

#### Documentação
- [x] Criar `docs/bounded-contexts/chat.md` com a documentação do novo contexto delimitado.
- [x] Atualizar `memory-bank/domainModel.md` com as novas entidades.
