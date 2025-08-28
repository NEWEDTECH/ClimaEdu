# Plano de Implementação da Funcionalidade SCORM

## Objetivo
Implementar a funcionalidade de upload e reprodução de conteúdo SCORM, garantindo a adesão à arquitetura de separação estrita entre Frontend e Backend.

## Arquitetura e Separação de Ambientes

- **Fronteira:** A API do Next.js (`src/app/api`) é a fronteira entre o cliente e o servidor.
- **Backend:** Lógica de negócio, manipulação de arquivos e acesso privilegiado ao Firebase com o **SDK Admin**.
- **Frontend:** UI, gerenciamento de estado local e comunicação com o backend exclusivamente via `fetch` para as API Routes.

---

### 1. Camada Compartilhada (Agnóstica de Ambiente)

- **Local:** `src/_core/modules/content/core/entities/`
- **Artefato:** `ScormContent.ts`
- **Descrição:** Uma `interface` ou `type` TypeScript simples que define a estrutura de dados do conteúdo SCORM. Pode ser importada com segurança por ambos os ambientes.

---

### 2. Camada de Backend (Server-Side)

- **Repositório:**
  - **Interface:** `IScormContentRepository.ts`
  - **Implementação:** `FirebaseAdminScormContentRepository.ts`
  - **Detalhes:** Usará o SDK `firebase-admin` para acesso ao Firestore e Storage. Conterá a lógica para descompactar o `.zip` e fazer o upload dos arquivos.
- **Casos de Uso:**
  - `UploadScormContentUseCase.ts`: Orquestra o upload, validação e persistência.
  - `GetScormContentUseCase.ts`: Busca os metadados de um conteúdo SCORM.
- **Container DI (Backend):**
  - Um container Inversify dedicado para as API Routes, que mapeia as interfaces do backend para suas implementações (`FirebaseAdmin...`).
- **API Routes:**
  - `POST /api/scorm/upload`: Recebe o `multipart/form-data` e executa o `UploadScormContentUseCase`.
  - `GET /api/scorm/content/[contentId]`: Busca os metadados via `GetScormContentUseCase`.
  - `GET /api/scorm/courses/[courseId]/[...filePath]`: Atua como um proxy seguro, fazendo o stream dos arquivos do Firebase Storage para o cliente, evitando problemas de CORS e exposição de URLs diretas do Storage.

---

### 3. Camada de Frontend (Client-Side)

- **Repositório:**
  - **Implementação:** `ScormContentAPIRepository.ts`
  - **Detalhes:** Implementará a mesma interface `IScormContentRepository` (ou uma variante para cliente), mas seus métodos usarão `fetch` para se comunicar com as API Routes. **Não conterá nenhuma importação do SDK do Firebase.**
- **Hooks:**
  - `useScormContent.ts`: Hook React para buscar os dados de um conteúdo SCORM de forma reativa, utilizando o `ScormContentAPIRepository`.
- **Container DI (Frontend):**
  - O container principal (`src/shared/container`) será atualizado para mapear a interface do repositório para a implementação `ScormContentAPIRepository`.
- **Componentes:**
  - **Componente de Upload:** Integrado ao formulário de criação/edição de lições.
  - **`<ScormPlayer>`:** Componente que recebe um `contentId`, usa o hook `useScormContent` para buscar os dados, e renderiza o conteúdo em um `iframe` que aponta para a API de proxy.
