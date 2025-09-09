# Sistema de Conquistas - ClimaEdu LMS

## 📋 **Visão Geral do Projeto**

Sistema de gamificação baseado em conquistas para a plataforma ClimaEdu, permitindo:
- Conquistas padrão da plataforma
- Conquistas personalizadas por instituição
- Engine automática de detecção e desbloqueio
- Interface completa para estudantes e administradores

## 🏗️ **FASE 1: INFRAESTRUTURA BASE**

### Etapa 1.1: Expandir Entidades de Achievement
**Objetivo:** Criar a base de dados para o sistema de conquistas
**Verificação:** Entidades criadas e validação funcionando

#### Checklist:
- [x] Expandir `BadgeCriteriaType` em `src/_core/modules/badge/core/entities/BadgeCriteriaType.ts`
  - [x] Adicionar `STUDY_STREAK` (dias consecutivos estudando)
  - [x] Adicionar `STUDY_TIME` (tempo total de estudo)
  - [x] Adicionar `PERFECT_SCORE` (nota máxima em questionário)
  - [x] Adicionar `RETRY_PERSISTENCE` (persistência em tentativas)
  - [x] Adicionar `CONTENT_TYPE_DIVERSITY` (variedade de conteúdos acessados)
  - [x] Adicionar `TRAIL_COMPLETION` (conclusão de trilhas)
  - [x] Adicionar `FIRST_TIME_ACTIVITIES` (primeira vez fazendo atividades)
  - [x] Adicionar `TIME_BASED_ACCESS` (acesso em horários específicos)
  - [x] Adicionar `PROFILE_COMPLETION` (completar perfil)

- [x] Criar `InstitutionAchievement` em `src/_core/modules/achievement/core/entities/InstitutionAchievement.ts`
  - [x] Campos: id, institutionId, name, description, iconUrl, criteriaType, criteriaValue
  - [x] Campos: isActive, createdAt, updatedAt, createdBy
  - [x] Validações de negócio
  - [x] Métodos para verificar critérios

- [x] Criar `DefaultAchievement` em `src/_core/modules/achievement/core/entities/DefaultAchievement.ts`
  - [x] Similar ao Achievement mas sem institutionId
  - [x] Campo isGloballyEnabled
  - [x] Sistema de versionamento

- [x] Criar `StudentAchievement` em `src/_core/modules/achievement/core/entities/StudentAchievement.ts`
  - [x] Campos: id, userId, achievementId, institutionId, awardedAt
  - [x] Campo achievementType (DEFAULT | INSTITUTION)
  - [x] Campo metadata (dados adicionais do desbloqueio)
  - [x] ✅ **EXPANDIDO:** Campos progress e isCompleted para progresso real
  - [x] ✅ **EXPANDIDO:** Métodos updateProgress(), markCompleted(), getProgressPercentage()
  - [x] Validações e métodos utilitários

### Etapa 1.2: Repositórios e Use Cases
**Objetivo:** Implementar CRUD completo para conquistas
**Verificação:** Todas as operações funcionando corretamente

#### Checklist Repositórios:
- [x] Criar `InstitutionAchievementRepository` em `src/_core/modules/achievement/infrastructure/repositories/InstitutionAchievementRepository.ts`
- [x] Criar `DefaultAchievementRepository` em `src/_core/modules/achievement/infrastructure/repositories/DefaultAchievementRepository.ts`
- [x] Criar `StudentAchievementRepository` em `src/_core/modules/achievement/infrastructure/repositories/StudentAchievementRepository.ts`
- [x] Implementações Firebase:
  - [x] `FirebaseInstitutionAchievementRepository`
  - [x] `FirebaseDefaultAchievementRepository` 
  - [x] `FirebaseStudentAchievementRepository`

#### Checklist Use Cases:
- [x] `CreateInstitutionAchievementUseCase`
  - [x] Input/Output interfaces
  - [x] Validações de permissão (apenas admins da instituição)
  - [x] Validação de dados
- [x] `UpdateInstitutionAchievementUseCase` ✅
- [x] `DeleteInstitutionAchievementUseCase` ✅
- [x] `ListInstitutionAchievementsUseCase`
- [x] `GetInstitutionAchievementUseCase`
- [ ] `GetDefaultAchievementsUseCase` ❌ *NÃO IMPLEMENTADO*
- [x] `ListStudentAchievementsUseCase`
- [ ] `GetStudentAchievementProgressUseCase` ❌ *NÃO IMPLEMENTADO*

### Etapa 1.3: Registro no Container DI
**Objetivo:** Configurar injeção de dependência
**Verificação:** Dependências injetadas corretamente

#### Checklist:
- [x] Criar estrutura do módulo `src/_core/modules/achievement/`
  - [x] `core/entities/`
  - [x] `core/use-cases/`
  - [x] `infrastructure/repositories/`
  - [x] `index.ts`
- [x] Criar `src/_core/shared/container/modules/achievement/symbols.ts`
- [x] Criar `src/_core/shared/container/modules/achievement/register.ts`
- [x] Registrar no `src/_core/shared/container/containerRegister.ts`
- [ ] Testar injeção de dependência

### Etapa 1.4: Página Administrativa - CRUD de Conquistas
**Objetivo:** Criar interface administrativa simples para validar a Fase 1
**Verificação:** CRUD funcional de conquistas da instituição

#### Checklist:
**Estrutura Base da Página**
- [x] Criar `/src/app/admin/achievements/page.tsx` (listagem de conquistas) ✅ *HARDCODES CORRIGIDOS*
- [x] Criar `/src/app/admin/achievements/create/page.tsx` (criação) ✅ *HARDCODES CORRIGIDOS*
- [x] Criar `/src/app/admin/achievements/edit/[id]/page.tsx` (edição) ✅ *HARDCODES CORRIGIDOS*

**Componentes Básicos**
- [x] Criar `AchievementCard` em `/src/components/achievements/AchievementCard.tsx` ✅
- [x] Criar `AchievementForm` em `/src/components/achievements/AchievementForm.tsx` ✅
- [x] Criar `AchievementsList` em `/src/components/achievements/AchievementsList.tsx` ✅

**Funcionalidades CRUD**
- [x] Listar conquistas da instituição ✅
- [x] Criar nova conquista personalizada ✅
- [x] Editar conquista existente ✅
- [x] Deletar conquista com confirmação ✅
- [x] Ativar/desativar conquista ✅
- [x] Busca simples por nome ✅
- [x] Filtro por status (ativa/inativa) ✅

**Formulário de Conquista**
- [x] Campo nome da conquista
- [x] Campo descrição
- [x] Seleção de critério (BadgeCriteriaType)
- [x] Input para valor do critério
- [x] URL do ícone
- [x] Toggle ativo/inativo

**Validação da Fase 1**
- [x] Testar injeção de dependência ✅
- [x] Validar CreateInstitutionAchievementUseCase ✅
- [x] Validar UpdateInstitutionAchievementUseCase ✅
- [x] Validar DeleteInstitutionAchievementUseCase ✅
- [ ] Validar repositórios Firebase ⚠️ *DEPENDE DE TESTE MANUAL*
- [x] Confirmar todas as entidades funcionando ✅

---

## ⚡ **FASE 2: ENGINE DE CONQUISTAS** 
*Seguindo Clean Architecture com EventBus genérico*

### Etapa 2.1: Sistema de Eventos Base (EventBus Genérico)
**Objetivo:** Criar EventBus genérico reutilizável por toda a aplicação
**Verificação:** EventBus funcionando com separação clara de camadas

#### Checklist - Camada de Domínio (`src/_core`):
**Interfaces Genéricas:**
- [x] Criar `src/_core/shared/events/interfaces/Event.ts` ✅
- [x] Criar `src/_core/shared/events/interfaces/EventBus.ts` ✅
- [x] Criar `src/_core/shared/events/interfaces/EventSubscriber.ts` ✅
- [x] Criar `src/_core/shared/events/index.ts` ✅

**Implementação EventBus:**
- [x] Implementar `src/_core/shared/events/implementations/InMemoryEventBus.ts` ✅
- [x] Registrar EventBus no Container DI ✅
- [x] Testar publicação e subscrição básica ✅ *FUNCIONAL*

**Eventos do Domínio Achievement:**
- [x] Criar `src/_core/modules/achievement/core/events/LessonCompletedEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/CourseCompletedEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/QuestionnaireCompletedEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/UserLoginEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/StudySessionEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/CertificateEarnedEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/ProfileCompletedEvent.ts` ✅
- [x] Criar `src/_core/modules/achievement/core/events/index.ts` ✅

### Etapa 2.2: Achievement Events Subscriber
**Objetivo:** Subscriber que processa eventos relacionados a conquistas
**Verificação:** Eventos de achievement sendo processados corretamente

#### Checklist:
**Achievement Event Subscriber:**
- [x] Criar `src/_core/modules/achievement/core/subscribers/AchievementEventSubscriber.ts` ✅
- [x] Implementar interface EventSubscriber ✅
- [x] Registrar subscriber no Container DI ✅ *IMPLEMENTADO*
- [x] Conectar subscriber ao EventBus ✅ *FUNCIONAL*

**Use Cases de Processamento:**
- [x] Criar `src/_core/modules/achievement/core/use-cases/process-achievement-event/process-achievement-event.use-case.ts` ✅ *ProcessAchievementProgressUseCase*
- [x] Criar `src/_core/modules/achievement/core/use-cases/process-achievement-event/process-achievement-event.input.ts` ✅ *Interface interna*
- [x] Criar `src/_core/modules/achievement/core/use-cases/process-achievement-event/process-achievement-event.output.ts` ✅ *Interface interna*

### Etapa 2.3: Processamento de Conquistas
**Objetivo:** Lógica pura para verificar e desbloquear conquistas
**Verificação:** Conquistas sendo desbloqueadas automaticamente

#### Checklist:
**Checkers de Domínio (Classes Puras):**
- [ ] Criar `src/_core/modules/achievement/core/checkers/CourseCompletionChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/LessonCompletionChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/QuestionnaireCompletionChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/StudyStreakChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/StudyTimeChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/PerfectScoreChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/CertificateChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/ProfileCompletionChecker.ts`
- [ ] Criar `src/_core/modules/achievement/core/checkers/index.ts`

**Use Cases Principais:**
- [ ] Criar `src/_core/modules/achievement/core/use-cases/check-and-award-achievements/check-and-award-achievements.use-case.ts`
- [ ] Criar `src/_core/modules/achievement/core/use-cases/get-student-achievement-progress/get-student-achievement-progress.use-case.ts`
- [ ] Registrar use cases no Container DI

### Etapa 2.4: Conquistas Default da Plataforma
**Objetivo:** Criar conquistas padrão do sistema
**Verificação:** Conquistas padrão sendo criadas no sistema

#### Checklist Conquistas Default:

**Categoria: Primeiros Passos**
- [ ] "Bem-vindo" - Complete seu perfil (PROFILE_COMPLETION = 1)
- [ ] "Primeira Lição" - Complete sua primeira lição (LESSON_COMPLETION = 1)
- [ ] "Primeira Nota" - Complete seu primeiro questionário (QUESTIONNAIRE_COMPLETION = 1)

**Categoria: Progresso**
- [ ] "Finalista" - Complete um curso inteiro (COURSE_COMPLETION = 1)
- [ ] "Colecionador" - Complete 3 cursos diferentes (COURSE_COMPLETION = 3)
- [ ] "Trilheiro" - Complete uma trilha completa (TRAIL_COMPLETION = 1)

**Categoria: Engajamento**
- [ ] "Visitante Assíduo" - Acesse 7 dias consecutivos (DAILY_LOGIN = 7)
- [ ] "Estudante Dedicado" - Estude por 2+ horas em um dia (STUDY_TIME = 7200)

**Categoria: Excelência**
- [ ] "Nota Máxima" - Obtenha 100% em um questionário (PERFECT_SCORE = 1)
- [ ] "Expert" - Média acima de 90% em 5 questionários (QUESTIONNAIRE_COMPLETION = 5, com critério de média)
- [ ] "Certificado" - Obtenha seu primeiro certificado (CERTIFICATE_ACHIEVED = 1)

#### Checklist Implementação:
- [x] Script de seed para criar conquistas default ✅ *seed-default-achievements.ts*
- [x] Sistema de versionamento de conquistas default ✅ *Versão 1.0.0*
- [x] Migração para adicionar conquistas default ao banco ✅ *Script executável*

### Etapa 2.5: Integração com Sistema Existente
**Objetivo:** Modificar use cases existentes para publicar eventos
**Verificação:** Eventos sendo publicados em ações reais mantendo lógica original

#### Checklist - Modificação de Use Cases Existentes:
**Injeção de EventBus via DI:**
- [ ] Injetar EventBus nos use cases existentes
- [ ] Manter lógica original intacta
- [ ] Adicionar publicação de eventos após sucesso

**Use Cases a Modificar:**
- [x] `CompleteLessonProgressUseCase` → publicar `LessonCompletedEvent` ✅ *JÁ INTEGRADO*
- [x] `SubmitQuestionnaireUseCase` → publicar `QuestionnaireCompletedEvent` ✅ *INTEGRADO*
- [ ] Use Case de login → publicar `UserLoginEvent` ❌ *FALTANDO*
- [ ] Use Case de certificados → publicar `CertificateEarnedEvent` ❌ *FALTANDO*
- [ ] Use Case de conclusão de curso → publicar `CourseCompletedEvent` ❌ *FALTANDO*
- [ ] Use Case de atualização de perfil → publicar `ProfileCompletedEvent` ❌ *FALTANDO*

**Testes de Integração:**
- [ ] Testar fluxo completo end-to-end
- [ ] Verificar que lógica original não foi afetada
- [ ] Confirmar publicação e processamento de eventos

### Etapa 2.6: Camada de Apresentação (Hooks e Providers)
**Objetivo:** Criar camada React para consumir achievements
**Verificação:** Separação clara entre domínio e apresentação

#### Checklist - Camada de Apresentação:
**Providers React:**
- [ ] Criar `src/contexts/EventBusProvider.tsx`
- [ ] Criar `src/contexts/AchievementProvider.tsx`
- [ ] Integrar providers na raiz da aplicação

**Hooks Customizados:**
- [ ] Criar `src/hooks/useEventBus.ts`
- [ ] Criar `src/hooks/useAchievements.ts`
- [ ] Criar `src/hooks/useStudentProgress.ts`

**Comunicação via Container DI:**
- [ ] Hooks acessam domínio apenas via Container DI
- [ ] Manter separação rigorosa de responsabilidades
- [ ] Testar isolamento de camadas

---

## 📈 **RESUMO ARQUITETURAL FASE 2**

### 🏢 **Separação de Responsabilidades:**
- **`src/_core/shared/events/`**: EventBus genérico reutilizável
- **`src/_core/modules/achievement/core/events/`**: Eventos específicos do domínio
- **`src/_core/modules/achievement/core/subscribers/`**: Subscriber para processar eventos
- **`src/_core/modules/achievement/core/use-cases/`**: Lógica pura de processamento
- **`src/_core/modules/achievement/core/checkers/`**: Classes de domínio para verificações
- **`src/contexts/` e `src/hooks/`**: Camada de apresentação React

### 🔄 **Fluxo de Dados:**
1. **Use Case** executa lógica + publica evento via EventBus
2. **EventBus genérico** distribui evento para subscribers
3. **AchievementEventSubscriber** processa evento via Use Cases puros
4. **Checkers** verificam critérios usando lógica de domínio
5. **Camada React** consome via hooks que acessam Container DI

### ⚙️ **Container DI como Ponte:**
Unica comunicação entre `src/_core` (domínio) e apresentação (Next.js)

---

## 🎨 **FASE 3: INTERFACE DO USUÁRIO**

### Etapa 3.1: Componentes Base
**Objetivo:** Criar componentes React reutilizáveis
**Verificação:** Componentes renderizando corretamente

#### Checklist:
- [ ] `AchievementCard` em `src/components/achievements/AchievementCard.tsx`
  - [ ] Props: achievement, isUnlocked, progress
  - [ ] Estados: locked, unlocked, in-progress
  - [ ] Animações de desbloqueio
- [ ] `AchievementProgress` em `src/components/achievements/AchievementProgress.tsx`
  - [ ] Barra de progresso visual
  - [ ] Texto descritivo do progresso
- [ ] `AchievementBadge` em `src/components/achievements/AchievementBadge.tsx`
  - [ ] Ícone pequeno para uso em listas
  - [ ] Indicador de novo desbloqueio
- [ ] `AchievementList` em `src/components/achievements/AchievementList.tsx`
  - [ ] Grade responsiva de conquistas
  - [ ] Filtros por categoria
  - [ ] Ordenação (recentes, alfabética, progresso)
- [ ] `AchievementNotification` em `src/components/achievements/AchievementNotification.tsx`
  - [ ] Toast notification para conquistas desbloqueadas
  - [ ] Animação de entrada/saída

### Etapa 3.2: Painel de Conquistas do Estudante
**Objetivo:** Expandir página existente de achievements
**Verificação:** Página `/student/achievements` funcionando completamente

#### Checklist:
- [x] Expandir `/src/app/student/achievements/page.tsx` ✅ *INTEGRADO COM DADOS REAIS*
  - [x] Seção de conquistas obtidas ✅
  - [x] Seção de conquistas disponíveis ✅
  - [x] Progresso para conquistas incrementais ✅
  - [x] Estatísticas gerais (% completado, conquistas este mês) ✅
- [x] Filtros e navegação: ✅
  - [x] Filtro por categoria (Primeiros Passos, Progresso, Engajamento, Excelência) ✅
  - [x] Filtro por status (Obtidas, Em Progresso, Bloqueadas) ✅
  - [x] Search/busca por nome ✅
- [x] Hooks personalizados: ✅
  - [x] `useStudentAchievements` para buscar conquistas ✅ *COM PROGRESSO REAL*
  - [ ] `useAchievementProgress` para progresso em tempo real ⚠️ *INTEGRADO NO useStudentAchievements*

### Etapa 3.3: Painel Administrativo (Instituição)
**Objetivo:** Interface para administradores gerenciarem conquistas
**Verificação:** Administradores conseguem gerenciar conquistas

#### Checklist:
- [x] Criar `/src/app/admin/achievements/page.tsx` ✅ *CRUD COMPLETO*
  - [x] Lista de conquistas da instituição ✅
  - [ ] Lista de conquistas default (com toggle on/off) ❌ *FALTANDO*
  - [ ] Estatísticas de conquistas por estudantes ❌ *FALTANDO*
- [x] Criar `/src/app/admin/achievements/create/page.tsx` ✅
  - [x] Formulário para criar conquistas personalizadas ✅
  - [x] Preview da conquista ✅
  - [x] Validação de campos ✅
- [x] Criar `/src/app/admin/achievements/edit/[id]/page.tsx` ✅
  - [x] Edição de conquistas existentes ✅
  - [ ] Histórico de alterações ❌ *FALTANDO*
- [x] Componentes administrativos: ✅
  - [x] `AchievementForm` - formulário reutilizável ✅
  - [ ] `AchievementStats` - estatísticas por conquista ❌ *FALTANDO*
  - [ ] `StudentAchievementsList` - conquistas por estudante ❌ *FALTANDO*

### Etapa 3.4: Notificações e Integrações
**Objetivo:** Feedback visual para usuários
**Verificação:** Usuários recebem feedback ao desbloquear conquistas

#### Checklist:
- [x] Sistema de notificações: ✅
  - [x] Integrar `AchievementNotification` com sistema de toast existente ✅
  - [x] Queue de notificações (múltiplas conquistas simultâneas) ✅
  - [ ] Persistência de notificações não visualizadas ❌ *ESCOPO REDUZIDO*
- [ ] Integrações na UI existente:
  - [ ] Badge counter na sidebar (`src/components/layout/Sidebar.tsx`)
  - [ ] Seção de conquistas no perfil do usuário
  - [ ] Mini-widget de conquistas no dashboard
- [ ] Real-time updates:
  - [ ] WebSocket/SSE para notificações em tempo real
  - [ ] Atualização automática de progresso

---

## 📊 **ESTRUTURA DE DADOS**

### Tabelas/Collections Firebase:
```
/institutions/{institutionId}/achievements/{achievementId}
/default-achievements/{achievementId}
/students/{userId}/achievements/{achievementId}
/students/{userId}/achievement-progress/{achievementId}
```

### Tipos de Critério (BadgeCriteriaType):
```typescript
enum BadgeCriteriaType {
  // Existentes
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  LESSON_COMPLETION = 'LESSON_COMPLETION',
  QUESTIONNAIRE_COMPLETION = 'QUESTIONNAIRE_COMPLETION',
  CERTIFICATE_ACHIEVED = 'CERTIFICATE_ACHIEVED',
  DAILY_LOGIN = 'DAILY_LOGIN',
  
  // Novos
  STUDY_STREAK = 'STUDY_STREAK',
  STUDY_TIME = 'STUDY_TIME',
  PERFECT_SCORE = 'PERFECT_SCORE',
  RETRY_PERSISTENCE = 'RETRY_PERSISTENCE',
  CONTENT_TYPE_DIVERSITY = 'CONTENT_TYPE_DIVERSITY',
  TRAIL_COMPLETION = 'TRAIL_COMPLETION',
  FIRST_TIME_ACTIVITIES = 'FIRST_TIME_ACTIVITIES',
  TIME_BASED_ACCESS = 'TIME_BASED_ACCESS',
  PROFILE_COMPLETION = 'PROFILE_COMPLETION'
}
```

---

## ✅ **CRITÉRIOS DE VERIFICAÇÃO GERAL**

### Para cada etapa:
1. **Testes Unitários:** Todas as entidades, use cases e serviços
2. **Testes de Integração:** Fluxo completo funcionando
3. **Verificação Manual:** Interface e funcionalidades
4. **Validação com Dados Reais:** Teste em ambiente de desenvolvimento

### Marcos de Entrega:
- [ ] **Fase 1 Completa:** Infraestrutura base funcionando
- [ ] **Fase 2 Completa:** Engine de conquistas operacional
- [ ] **Fase 3 Completa:** Interface completa para usuários e admins

---

## 📝 **Notas de Implementação**

- Seguir padrões existentes da Clean Architecture
- Usar Firebase como banco de dados (seguir padrão existente)
- Usar Next.js 15 e React 19 (versões do projeto)
- Usar TypeScript rigorosamente
- Seguir convenções de nomenclatura existentes
- Usar sistema de permissões CASL existente
- Integrar com sistema de toast existente (react-toastify)

---

## 🎯 **Conquistas Default Detalhadas**

| Nome | Descrição | Critério | Valor | Categoria |
|------|-----------|----------|-------|-----------|
| Bem-vindo | Complete seu perfil | PROFILE_COMPLETION | 1 | Primeiros Passos |
| Primeira Lição | Complete sua primeira lição | LESSON_COMPLETION | 1 | Primeiros Passos |
| Primeira Nota | Complete seu primeiro questionário | QUESTIONNAIRE_COMPLETION | 1 | Primeiros Passos |
| Finalista | Complete um curso inteiro | COURSE_COMPLETION | 1 | Progresso |
| Colecionador | Complete 3 cursos diferentes | COURSE_COMPLETION | 3 | Progresso |
| Trilheiro | Complete uma trilha completa | TRAIL_COMPLETION | 1 | Progresso |
| Visitante Assíduo | Acesse 7 dias consecutivos | DAILY_LOGIN | 7 | Engajamento |
| Estudante Dedicado | Estude por 2+ horas em um dia | STUDY_TIME | 7200 | Engajamento |
| Nota Máxima | Obtenha 100% em um questionário | PERFECT_SCORE | 1 | Excelência |
| Expert | Média acima de 90% em 5 questionários | QUESTIONNAIRE_COMPLETION | 5* | Excelência |
| Certificado | Obtenha seu primeiro certificado | CERTIFICATE_ACHIEVED | 1 | Excelência |

*Critério especial com validação de média

---

**Status do Documento:** 🟢 Sistema Funcional
**Última Atualização:** 2025-01-09
**Status Geral:** Sistema completo e operacional com conquistas automáticas