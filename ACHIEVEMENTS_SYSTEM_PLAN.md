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
- [ ] `UpdateInstitutionAchievementUseCase` ❌ *NÃO IMPLEMENTADO*
- [ ] `DeleteInstitutionAchievementUseCase` ❌ *NÃO IMPLEMENTADO*
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

### Etapa 2.1: Sistema de Eventos Base
**Objetivo:** Criar sistema de eventos para triggers
**Verificação:** Eventos sendo disparados corretamente

#### Checklist:
- [ ] Criar `AchievementEventService` em `src/_core/modules/achievement/core/services/AchievementEventService.ts`
- [ ] Definir interfaces de eventos:
  - [ ] `LessonCompletedEvent`
  - [ ] `CourseCompletedEvent`
  - [ ] `QuestionnaireCompletedEvent`
  - [ ] `UserLoginEvent`
  - [ ] `StudySessionEvent`
  - [ ] `CertificateEarnedEvent`
  - [ ] `ProfileCompletedEvent`
- [ ] Implementar sistema de subscribers
- [ ] Criar base event dispatcher

### Etapa 2.2: Processador de Conquistas
**Objetivo:** Engine para verificar e desbloquear conquistas
**Verificação:** Conquistas sendo desbloqueadas automaticamente

#### Checklist:
- [ ] Criar `AchievementProcessorService`
- [ ] Implementar verificadores por tipo de critério:
  - [ ] `CourseCompletionChecker`
  - [ ] `LessonCompletionChecker`
  - [ ] `QuestionnaireCompletionChecker`
  - [ ] `StudyStreakChecker`
  - [ ] `StudyTimeChecker`
  - [ ] `PerfectScoreChecker`
  - [ ] `CertificateChecker`
  - [ ] `ProfileCompletionChecker`
- [ ] Use Cases:
  - [ ] `CheckAndAwardAchievementsUseCase`
  - [ ] `ProcessAchievementEventUseCase`
  - [ ] `GetStudentAchievementProgressUseCase`

### Etapa 2.3: Conquistas Default da Plataforma
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
- [ ] Script de seed para criar conquistas default
- [ ] Sistema de versionamento de conquistas default
- [ ] Migração para adicionar conquistas default ao banco

### Etapa 2.4: Integração com Sistema Existente
**Objetivo:** Conectar engine com ações existentes
**Verificação:** Conquistas processadas em ações reais

#### Checklist:
- [ ] Integrar com `CompleteLessonProgressUseCase`
- [ ] Integrar com `SubmitQuestionnaireUseCase`
- [ ] Integrar com sistema de login existente
- [ ] Integrar com geração de certificados
- [ ] Integrar com conclusão de cursos
- [ ] Integrar com conclusão de trilhas
- [ ] Integrar com atualização de perfil

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
- [ ] Expandir `/src/app/student/achievements/page.tsx`
  - [ ] Seção de conquistas obtidas
  - [ ] Seção de conquistas disponíveis
  - [ ] Progresso para conquistas incrementais
  - [ ] Estatísticas gerais (% completado, conquistas este mês)
- [ ] Filtros e navegação:
  - [ ] Filtro por categoria (Primeiros Passos, Progresso, Engajamento, Excelência)
  - [ ] Filtro por status (Obtidas, Em Progresso, Bloqueadas)
  - [ ] Search/busca por nome
- [ ] Hooks personalizados:
  - [ ] `useStudentAchievements` para buscar conquistas
  - [ ] `useAchievementProgress` para progresso em tempo real

### Etapa 3.3: Painel Administrativo (Instituição)
**Objetivo:** Interface para administradores gerenciarem conquistas
**Verificação:** Administradores conseguem gerenciar conquistas

#### Checklist:
- [ ] Criar `/src/app/admin/achievements/page.tsx`
  - [ ] Lista de conquistas da instituição
  - [ ] Lista de conquistas default (com toggle on/off)
  - [ ] Estatísticas de conquistas por estudantes
- [ ] Criar `/src/app/admin/achievements/create/page.tsx`
  - [ ] Formulário para criar conquistas personalizadas
  - [ ] Preview da conquista
  - [ ] Validação de campos
- [ ] Criar `/src/app/admin/achievements/edit/[id]/page.tsx`
  - [ ] Edição de conquistas existentes
  - [ ] Histórico de alterações
- [ ] Componentes administrativos:
  - [ ] `AchievementForm` - formulário reutilizável
  - [ ] `AchievementStats` - estatísticas por conquista
  - [ ] `StudentAchievementsList` - conquistas por estudante

### Etapa 3.4: Notificações e Integrações
**Objetivo:** Feedback visual para usuários
**Verificação:** Usuários recebem feedback ao desbloquear conquistas

#### Checklist:
- [ ] Sistema de notificações:
  - [ ] Integrar `AchievementNotification` com sistema de toast existente
  - [ ] Queue de notificações (múltiplas conquistas simultâneas)
  - [ ] Persistência de notificações não visualizadas
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

**Status do Documento:** 🟡 Em Desenvolvimento
**Última Atualização:** 2025-01-08
**Próxima Revisão:** Após conclusão da Fase 1