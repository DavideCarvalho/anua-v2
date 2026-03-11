# Menu de criacao por dia no calendario pedagogico Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Traduzir o CTA de dia vazio e adicionar menu por dia para criar atividade, prova ou evento com data pre-preenchida.

**Architecture:** O `Calendar` passa callbacks opcionais para a visao mensal. O `DayCell` usa um `Popover` para escolher o tipo de criacao. O container pedagogico recebe a acao e abre as modais oficiais com `defaultDate`.

**Tech Stack:** React, TypeScript, @base-ui/react/popover, TanStack Query, Adonis Inertia.

---

### Task 1: Propagar acao de dia vazio no calendario

**Files:**

- Modify: `inertia/components/calendar.tsx`
- Modify: `inertia/components/calendar-body.tsx`
- Modify: `inertia/components/calendar-month-view.tsx`

**Step 1: Definir contrato de callback no Calendar**

- Adicionar `onEmptyDayAction` e `emptyDayActionLabel` em `CalendarProps`.

**Step 2: Encaminhar props para CalendarBody**

- Passar as novas props para `CalendarBody`.

**Step 3: Encaminhar props da body para month-view**

- Tipar `CalendarBodyProps`.
- Repassar para `CalendarMonthView` apenas no modo `month`.

**Step 4: Encaminhar props para DayCell**

- Tipar `CalendarMonthView` com os novos campos e repassar para cada celula.

**Step 5: Verificar build de tipos**

Run: `pnpm test:browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: suite executa sem erro de tipagem/runtime.

### Task 2: Substituir CTA vazio por menu em PT-BR

**Files:**

- Modify: `inertia/components/day-cell.tsx`

**Step 1: Traduzir CTA default**

- Trocar `Add Event` por `Novo evento` no fallback sem callback externo.

**Step 2: Adicionar popover de criacao por tipo**

- Quando `onEmptyDayAction` existir, renderizar trigger `Novo item`.
- Exibir opcoes: `Nova atividade`, `Nova prova`, `Novo evento`.

**Step 3: Acionar callback com data e tipo**

- Em cada opcao, chamar `onEmptyDayAction(date, action)`.
- Fechar popover apos clique.

**Step 4: Ajustar comportamento mobile**

- Tornar trigger visivel sem hover em telas pequenas.
- Evitar envolver dia vazio no `EventListDialog` mobile.

**Step 5: Verificar visual e fluxo**

Run: `pnpm test:browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: interacoes do calendario continuam passando.

### Task 3: Integrar com modais oficiais no container pedagogico

**Files:**

- Modify: `inertia/containers/pedagogico/pedagogical-calendar.tsx`
- Modify: `inertia/containers/turma/new-assignment-modal.tsx`
- Modify: `inertia/containers/turma/new-exam-modal.tsx`
- Modify: `inertia/containers/events/new-event-modal.tsx`

**Step 1: Criar estado de data da acao de dia**

- Adicionar `dayActionDate` no container.

**Step 2: Abrir modal correta por acao**

- Implementar `handleEmptyDayAction(date, action)`.
- Abrir `newAssignmentOpen`, `newExamOpen` ou `newEventOpen`.

**Step 3: Passar callback para Calendar**

- `emptyDayActionLabel="Novo item"`
- `onEmptyDayAction={handleEmptyDayAction}`

**Step 4: Suportar pre-preenchimento de data nas modais**

- Adicionar `defaultDate?: Date` em cada modal.
- Usar `defaultDate` ao inicializar/resetar o formulario quando abrir.

**Step 5: Limpar estado de data ao fechar**

- Resetar `dayActionDate` para `null` no fechamento das modais.

### Task 4: Verificacao final

**Files:**

- Modify: `tests/browser/escola/pedagogico/calendario.spec.ts` (apenas se necessario)

**Step 1: Rodar suite alvo**

Run: `pnpm test:browser --files tests/browser/escola/pedagogico/calendario.spec.ts`
Expected: `4 passed`.

**Step 2: Validacao manual rapida**

- Abrir `/escola/pedagogico/calendario`.
- Hover/click em dia vazio.
- Confirmar menu com 3 opcoes e abertura da modal correta.

**Step 3: Commit**

```bash
git add inertia/components/calendar.tsx inertia/components/calendar-body.tsx inertia/components/calendar-month-view.tsx inertia/components/day-cell.tsx inertia/containers/pedagogico/pedagogical-calendar.tsx inertia/containers/turma/new-assignment-modal.tsx inertia/containers/turma/new-exam-modal.tsx inertia/containers/events/new-event-modal.tsx docs/plans/2026-03-11-calendario-dia-menu-criacao-design.md docs/plans/2026-03-11-calendario-dia-menu-criacao-implementation-plan.md
git commit -m "feat: add day creation menu for pedagogical calendar"
```
