# CHECKLIST: SISTEMA DE DISPONIBILIDADE DE TUTORES - MÓDULO TUTORING

## 📋 STATUS GERAL: ✅ BACKEND COMPLETO - FRONTEND PENDENTE

### 🎯 **OBJETIVO:**
Implementar um sistema completo de disponibilidade de tutores onde:
- Tutores podem configurar seus horários disponíveis
- Estudantes veem apenas horários reais disponíveis
- Sistema valida conflitos automaticamente
- Duração das sessões é flexível

---

## 🔄 **NOVO FLUXO DE AGENDAMENTO:**

### **❌ FLUXO ANTERIOR:**
```
Aluno seleciona curso → Horários fixos hardcoded → Duração fixa 60min → Agenda
```

### **✅ FLUXO NOVO:**
```
Tutor configura disponibilidade → Aluno seleciona curso → Sistema busca tutores disponíveis → 
Aluno escolhe data/horário/duração → Sistema valida conflitos → Agenda
```

---

## 🏗️ **BACKEND - INFRAESTRUTURA (100% COMPLETO)**

### ✅ **1. Entidade TimeSlot**
- [x] **Entidade completa**: `src/_core/modules/tutoring/core/entities/TimeSlot.ts`
- [x] **Enum DayOfWeek**: Domingo (0) a Sábado (6)
- [x] **Validações**: Formato HH:MM, duração mín/máx, sobreposições
- [x] **Métodos utilitários**: getDurationInMinutes(), overlapsWith(), containsTime()

### ✅ **2. Repositório TimeSlot**
- [x] **Interface**: `src/_core/modules/tutoring/infrastructure/repositories/TimeSlotRepository.ts`
- [x] **Implementação Firebase**: `src/_core/modules/tutoring/infrastructure/repositories/implementations/FirebaseTimeSlotRepository.ts`
- [x] **Métodos completos**: save, findByTutorId, findByTutorAndDay, findOverlapping, etc.
- [x] **Coleção Firestore**: `tutor-time-slots`

### ✅ **3. Use Cases**
- [x] **CreateTimeSlotUseCase**: Criar slots de disponibilidade
  - Input/Output definidos
  - Validação de sobreposições
  - Validação de formato de tempo
- [x] **FindAvailableTimeSlotsUseCase**: Buscar horários disponíveis
  - Busca por curso/tutor
  - Validação de conflitos com sessões existentes
  - Geração de horários possíveis em intervalos de 15min

### ✅ **4. Container DI**
- [x] **Símbolos atualizados**: `src/_core/shared/container/modules/tutoring/symbols.ts`
- [x] **Registros completos**: `src/_core/shared/container/modules/tutoring/register.ts`
- [x] **Exports atualizados**: `src/_core/modules/tutoring/index.ts`

---

## 🖥️ **FRONTEND - INTERFACE (0% COMPLETO)**

### ⏳ **5. Interface do Tutor (PENDENTE)**
- [ ] **AvailabilityManager.tsx**: Tela principal de configuração
- [ ] **WeeklyScheduleGrid.tsx**: Grade semanal de horários
- [ ] **TimeSlotEditor.tsx**: Editor de slots individuais
- [ ] **AvailabilityCalendar.tsx**: Calendário de disponibilidade
- [ ] **ConflictWarning.tsx**: Avisos de conflitos

### ⏳ **6. Interface do Estudante (PENDENTE)**
- [ ] **TutoringScheduleForm.tsx**: Atualizar para usar dados reais
- [ ] **TutorSelector.tsx**: Seleção de tutor disponível
- [ ] **DurationSelector.tsx**: Seleção de duração da sessão
- [ ] **AvailabilityChecker.tsx**: Validação em tempo real

### ⏳ **7. Hooks Personalizados (PENDENTE)**
- [ ] **useAvailabilityManager.ts**: Gerenciar disponibilidade do tutor
- [ ] **useAvailableTimeSlots.ts**: Buscar horários disponíveis
- [ ] **useTimeSlotValidator.ts**: Validar conflitos

---

## 📊 **ARQUIVOS IMPLEMENTADOS (8/8 BACKEND):**

### ✅ **DOMÍNIO (2/2):**
1. [x] **`TimeSlot.ts`**: Entidade completa com validações
2. [x] **`TimeSlotRepository.ts`**: Interface com 15+ métodos

### ✅ **INFRAESTRUTURA (1/1):**
3. [x] **`FirebaseTimeSlotRepository.ts`**: Implementação completa Firebase

### ✅ **APLICAÇÃO (2/2):**
4. [x] **`CreateTimeSlotUseCase`**: Input, Output, Use Case
5. [x] **`FindAvailableTimeSlotsUseCase`**: Input, Output, Use Case

### ✅ **CONTAINER DI (3/3):**
6. [x] **`symbols.ts`**: Símbolos atualizados
7. [x] **`register.ts`**: Registros completos
8. [x] **`index.ts`**: Exports atualizados

---

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS:**

### ✅ **GESTÃO DE DISPONIBILIDADE:**
- **Criação de slots**: Tutores podem criar horários disponíveis
- **Validação de conflitos**: Sistema impede sobreposições
- **Flexibilidade**: Slots de 30min a 8h, recorrência configurável
- **Persistência**: Dados salvos no Firebase Firestore

### ✅ **BUSCA INTELIGENTE:**
- **Por curso**: Encontra tutores disponíveis para o curso
- **Por tutor específico**: Busca disponibilidade de um tutor
- **Validação de conflitos**: Verifica sessões já agendadas
- **Intervalos flexíveis**: Horários a cada 15 minutos

### ✅ **VALIDAÇÕES ROBUSTAS:**
- **Formato de tempo**: HH:MM obrigatório
- **Duração mínima**: 30 minutos
- **Duração máxima**: 8 horas
- **Data futura**: Não permite agendamento no passado
- **Sobreposições**: Impede conflitos de horário

---

## 🎯 **PRÓXIMOS PASSOS (FRONTEND):**

### **ETAPA 1: INTERFACE DO TUTOR**
1. [ ] Criar `AvailabilityManager.tsx` - Tela principal
2. [ ] Criar `WeeklyScheduleGrid.tsx` - Grade semanal
3. [ ] Criar `TimeSlotEditor.tsx` - Editor de slots
4. [ ] Criar hooks `useAvailabilityManager.ts`

### **ETAPA 2: ATUALIZAR AGENDAMENTO**
1. [ ] Atualizar `TutoringScheduleForm.tsx`
2. [ ] Remover horários hardcoded
3. [ ] Integrar com `FindAvailableTimeSlotsUseCase`
4. [ ] Adicionar seleção de duração

### **ETAPA 3: COMPONENTES DE SUPORTE**
1. [ ] Criar `DurationSelector.tsx`
2. [ ] Criar `TutorSelector.tsx`
3. [ ] Criar `AvailabilityChecker.tsx`
4. [ ] Criar hooks de validação

---

## 🔧 **ESTRUTURA DE DADOS IMPLEMENTADA:**

### **TimeSlot no Firestore:**
```typescript
// Coleção: 'tutor-time-slots'
{
  id: 'tsl_1736870400000_abc123',
  tutorId: 'usr_tutor123',
  dayOfWeek: 1, // Monday
  startTime: '09:00',
  endTime: '12:00',
  isAvailable: true,
  recurrenceEndDate: '2024-12-31',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Busca de Disponibilidade:**
```typescript
// Input
{
  courseId: 'crs_123',
  date: new Date('2024-01-15'),
  duration: 90, // 1h30min
  tutorId?: 'usr_tutor123' // opcional
}

// Output
{
  availableSlots: [
    {
      timeSlot: TimeSlot,
      tutorId: 'usr_tutor123',
      availableStartTimes: ['09:00', '09:15', '09:30', '10:00']
    }
  ],
  totalSlotsFound: 1
}
```

---

## 🎉 **STATUS ATUAL: 50% COMPLETO**

### **✅ CONCLUÍDO (8/16 arquivos):**
- ✅ **Backend**: 100% completo (8/8)
- ✅ **Domínio**: Entidades e repositórios
- ✅ **Aplicação**: Use cases funcionais
- ✅ **Infraestrutura**: Firebase integrado
- ✅ **Container DI**: Registros completos

### **⏳ PENDENTE (8/16 arquivos):**
- ⏳ **Frontend**: 0% completo (0/8)
- ⏳ **Interface do Tutor**: Configuração de disponibilidade
- ⏳ **Interface do Estudante**: Agendamento inteligente
- ⏳ **Hooks**: Integração com use cases

### **🏆 RESULTADO ESPERADO:**
Após a conclusão do frontend, o sistema terá:
- **Tutores**: Controle total sobre disponibilidade
- **Estudantes**: Agendamento baseado em dados reais
- **Sistema**: Validação automática de conflitos
- **UX**: Processo fluido e intuitivo

**Data de Atualização**: 14/01/2025 - 16:39
**Progresso**: 50% Completo (Backend 100%, Frontend 0%)
**Próximo**: Implementar interface do tutor para configurar disponibilidade
