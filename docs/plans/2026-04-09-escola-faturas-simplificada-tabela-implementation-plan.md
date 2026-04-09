# Escola Faturas Simplificada - Tabela Objetiva Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar uma tabela objetiva no modo simplificado de `/escola/financeiro/faturas`, mostrando apenas cobrancas acionaveis com quatro colunas (`Aluno`, `Vencimento`, `Valor`, `Acao`).

**Architecture:** Vamos criar um container dedicado para a visao simplificada, separado do `InvoicesContainer` completo para manter DRY e evitar acoplamento com filtros/colunas avancadas. O novo container consulta o mesmo endpoint de faturas, mas fixa status acionaveis e renderiza uma tabela minima com CTA derivado do status. A pagina de faturas passa a usar esse container apenas no `viewMode === 'simple'`.

**Tech Stack:** React + Inertia, TanStack Query, nuqs, Japa browser tests, AdonisJS API (`/api/v1/invoices`).

---

### Task 1: Criar contrato de comportamento com teste browser (RED)

**Files:**
- Modify: `tests/browser/escola/simplified_layout_modules.spec.ts`

**Step 1: Write the failing test**

Adicionar um novo teste no grupo atual para `/escola/financeiro/faturas` em modo simplificado validando:
- existe tabela simplificada de faturas
- cabecalhos `Aluno`, `Vencimento`, `Valor`, `Acao`
- nao existem cabecalhos da tabela completa (`Referência`, `Descontos`, `Encargos`, `Valor Recebido`, `Total Cobrado`, `Status`)

Exemplo de alvo:

```ts
await modulePage.assertExists('[data-testid="simplified-invoices-table"]')
await modulePage.assertExists('th:has-text("Aluno")')
await modulePage.assertExists('th:has-text("Vencimento")')
await modulePage.assertExists('th:has-text("Valor")')
await modulePage.assertExists('th:has-text("Ação")')
await modulePage.assertNotExists('th:has-text("Referência")')
await modulePage.assertNotExists('th:has-text("Total Cobrado")')
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: FAIL dizendo que o seletor `simplified-invoices-table` nao existe (ainda estamos renderizando `InvoicesContainer`).

**Step 3: Commit (optional checkpoint)**

```bash
git add tests/browser/escola/simplified_layout_modules.spec.ts
git commit -m "test: define simplified invoices table contract"
```

### Task 2: Implementar container dedicado da visao simplificada (GREEN)

**Files:**
- Create: `inertia/containers/invoices-simplified-table.tsx`
- Modify: `inertia/pages/escola/financeiro/faturas.tsx`

**Step 1: Write minimal implementation**

Criar `InvoicesSimplifiedTable` com:
- Query para `api.api.v1.invoices.index` com `status: 'OPEN,PENDING,OVERDUE'`
- Ordenacao padrao por vencimento ascendente (`sortBy: 'dueDate'`, `sortDirection: 'asc'`)
- Tabela minima com `data-testid="simplified-invoices-table"`
- Colunas: `Aluno`, `Vencimento`, `Valor`, `Ação`
- CTA por status:
  - `OVERDUE` -> `Negociar`
  - `OPEN`/`PENDING` -> `Receber`
- Estados:
  - loading simples
  - vazio: "Nenhuma fatura pendente ou vencida"
  - erro com botao `Tentar novamente`

Exemplo de regra de acao:

```ts
const actionLabel = invoice.status === 'OVERDUE' ? 'Negociar' : 'Receber'
```

No `FaturasPage`, no branch simplificado, substituir:

```tsx
<InvoicesContainer />
```

por:

```tsx
<InvoicesSimplifiedTable />
```

**Step 2: Keep full view untouched**

Garantir que a visao completa continua renderizando `InvoicesContainer` sem alteracoes de comportamento.

**Step 3: Run test to verify it passes**

Run: `pnpm test:browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: PASS para o novo contrato da tabela simplificada.

**Step 4: Commit**

```bash
git add inertia/containers/invoices-simplified-table.tsx inertia/pages/escola/financeiro/faturas.tsx tests/browser/escola/simplified_layout_modules.spec.ts
git commit -m "feat: add objective simplified invoices table for actionable charges"
```

### Task 3: Cobrir regras de acao e regressao de view mode

**Files:**
- Modify: `tests/browser/escola/dashboard_view_mode.spec.ts`

**Step 1: Write failing assertions**

Adicionar caso que entra em `/escola/financeiro/faturas` no modo simplificado e valida:
- tabela simplificada presente
- visao completa nao vaza colunas
- botao de alternancia de modo continua funcional

Opcional adicional (se houver fixture com `OVERDUE`): validar botao `Negociar`.

**Step 2: Run test to verify behavior**

Run: `pnpm test:browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS apos ajustes de seletores e estabilidade.

**Step 3: Commit**

```bash
git add tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "test: cover simplified invoices table in view-mode flows"
```

### Task 4: Verificacao final e limpeza

**Files:**
- Modify (if needed): `inertia/containers/invoices-simplified-table.tsx`

**Step 1: Run final verification suite**

Run:

```bash
pnpm test:browser --files tests/browser/escola/simplified_layout_modules.spec.ts
pnpm test:browser --files tests/browser/escola/dashboard_view_mode.spec.ts
```

Expected: ambos PASS.

**Step 2: Manual smoke check (recommended)**

Verificar no browser local:
- `http://localhost:3333/escola/financeiro/faturas`
- alternar entre `Visão completa` e `Visão simplificada`
- confirmar que simplificada mostra somente 4 colunas.

**Step 3: Final commit (if previous checkpoints skipped)**

```bash
git add inertia/containers/invoices-simplified-table.tsx inertia/pages/escola/financeiro/faturas.tsx tests/browser/escola/simplified_layout_modules.spec.ts tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "feat: simplify invoices table for school dashboard simple mode"
```
