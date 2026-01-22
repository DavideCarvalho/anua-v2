# Design: Geração Automática de Grade de Horários

**Data:** 2026-01-22
**Status:** Aprovado

## Objetivo

Implementar a funcionalidade de geração automática de grade de horários para turmas, seguindo o padrão do `school-super-app`. O sistema deve permitir configurar um template de horários e distribuir automaticamente professores/matérias nos slots, com ajuste manual via drag-and-drop.

## Fluxo do Usuário

1. Selecionar turma e período letivo
2. Configurar template da semana (hora início, nº aulas, duração, intervalo)
3. Clicar "Gerar Grade"
4. Sistema cria slots e distribui TeacherHasClass automaticamente
5. Aulas não alocadas aparecem em "Aulas Pendentes"
6. Usuário ajusta manualmente via drag-and-drop
7. Salvar

---

## Backend

### Endpoint: `POST /api/v1/schedules/class/:classId/generate`

**Controller:** `app/controllers/schedules/generate_class_schedule_controller.ts`

**Input:**
```typescript
{
  academicPeriodId: string
  config: {
    startTime: string        // "07:30"
    classesPerDay: number    // 6
    classDuration: number    // 50 (minutos)
    breakAfterClass: number  // 3 (intervalo após 3ª aula)
    breakDuration: number    // 20 (minutos)
  }
}
```

**Algoritmo de geração (baseado no school-super-app):**
1. Criar slots vazios para cada dia (Seg-Sex) baseado no config
2. Buscar todos os `TeacherHasClass` da turma com `subjectQuantity`
3. Ordenar professores por carga horária (mais aulas primeiro)
4. Para cada slot vazio, tentar encaixar uma matéria:
   - Verificar se professor está disponível (TeacherAvailability)
   - Verificar se professor não está em outra turma no mesmo horário
   - Respeitar `subjectQuantity` (não exceder)
   - Evitar mesma matéria mais de 2x seguidas
   - Preferir continuar matéria já iniciada (até 2 consecutivas)
5. Executar 3 tentativas paralelas com ordem diferente
6. Retornar tentativa com menos erros

**Output:**
```typescript
{
  calendar: { id: string, name: string, isActive: boolean }
  slots: CalendarSlot[]
  unscheduled: TeacherHasClass[]  // aulas que não couberam
}
```

### Helpers (seguindo school-super-app)

- `getOccupiedSlotsForTeachers()` - Busca slots ocupados do professor em outras turmas
- `isSlotOccupied()` - Verifica conflito de horário
- `findBestSubjectForSlot()` - Seleciona melhor matéria para o slot
- `checkTeacherAvailability()` - Valida disponibilidade do professor

---

## Frontend

### Componente: `ScheduleConfigForm`

**Arquivo:** `inertia/containers/schedule/schedule-config-form.tsx`

**Props:**
```typescript
{
  classId: string
  academicPeriodId: string
  onGenerate: (result: GenerateResult) => void
  isLoading?: boolean
}
```

**Campos:**
- Hora de início (time input)
- Aulas por dia (number input, 1-10)
- Duração da aula em minutos (number input, 30-60)
- Intervalo após qual aula (number input)
- Duração do intervalo em minutos (number input, 10-30)

### Integração na página `/escola/pedagogico/horarios`

**Lógica de exibição:**
- Se não tem grade configurada → Mostra `ScheduleConfigForm`
- Se já tem grade → Mostra `ScheduleGrid` + botão "Reconfigurar"
- Ao clicar "Reconfigurar" → Mostra modal com `ScheduleConfigForm`

**Fluxo após geração:**
1. Chama endpoint de geração
2. Atualiza estado local com slots retornados
3. Aulas em `unscheduled` aparecem em "Aulas Pendentes"
4. Usuário pode arrastar para ajustar
5. Botão "Salvar" persiste no banco

---

## Modelos Existentes (já implementados)

- `Calendar` - Versão da grade para uma turma
- `CalendarSlot` - Slot individual com teacher/subject
- `TeacherHasClass` - Atribuição professor-matéria-turma
- `TeacherAvailability` - Disponibilidade do professor (se existir)

---

## Ordem de Implementação

1. Backend: Endpoint de geração com algoritmo
2. Frontend: Componente ScheduleConfigForm
3. Frontend: Integração na página de horários
4. Testes manuais

---

## Referência

Baseado na implementação do `school-super-app`:
- Algoritmo: `packages/api/src/router/school/utils/schedule-generation.ts`
- Endpoint: `packages/api/src/router/school/endpoints/generate-school-calendar.ts`
- UI: `apps/anua/src/components/school-calendar-grid/`
