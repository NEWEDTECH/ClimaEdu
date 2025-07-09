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
    - [x] **NOVO**: Adicionado nome do usuário nas mensagens usando `useProfile`
    - [x] **NOVO**: Mensagens agora exibem o nome real do usuário em vez de "Usuário {userId}"

#### Funcionalidades Implementadas
- [x] **Chat em Tempo Real**: Implementado sistema de mensagens em tempo real usando Firestore listeners
  - Adicionado método `subscribeToMessages` no FirebaseChatRoomRepository
  - Implementado listener com `onSnapshot` do Firestore
  - ChatDropdown agora usa subscription em vez de polling
  - Mensagens aparecem instantaneamente para todos os usuários
  - Cleanup automático dos listeners quando componente é desmontado

#### Bugs Corrigidos
- [x] **randomUUID Error**: Erro do `crypto.randomUUID` no browser foi resolvido pelo usuário
- [x] **User not participant Error**: Corrigido fluxo para garantir que usuário seja adicionado como participante antes de enviar mensagens
- [x] **AddParticipantUseCase**: Tornado idempotente para não falhar quando usuário já é participante
- [x] **Invalid Date Error**: Corrigido erro "Invalid time value" nas funções formatDate/formatTime
  - Adicionada validação de datas no ChatDropdown.tsx
  - Corrigida conversão de Timestamps do Firestore para Date no FirebaseChatRoomRepository
  - Métodos getMessages e getParticipants agora convertem corretamente Timestamps para objetos Date
- [x] **Real-time Updates**: Resolvido problema onde mensagens só apareciam após recarregar a página
  - Implementado sistema de listeners em tempo real
  - Removida duplicação de mensagens no estado local
  - Mensagens são ordenadas automaticamente por data de envio

#### Documentação
- [x] Criar `docs/bounded-contexts/chat.md` com a documentação do novo contexto delimitado.
- [x] Atualizar `memory-bank/domainModel.md` com as novas entidades.
