# Contratos Inativos na Edicao de Periodo Letivo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Exibir contratos ativos e inativos na 2a etapa da edicao de periodo letivo e sinalizar visualmente quando uma turma estiver vinculada a contrato cancelado/inativo.

**Architecture:** A API de contratos ja suporta `status=all`; o ajuste principal fica no frontend do formulario de edicao de periodo letivo. Vamos mudar a query de contratos para trazer todos os status e enriquecer o componente com indicador de alerta (icone + badge + tooltip) para contratos inativos, sem bloquear salvamento.

**Tech Stack:** React, TypeScript, TanStack Query, AdonisJS Inertia, shadcn/ui, Lucide.

---

### Task 1: Cobrir comportamento com teste funcional da API de contratos

**Files:**

- Modify: `tests/functional/contracts/list_contracts_controller.spec.ts`
- Reference: `app/controllers/contracts/list_contracts_controller.ts`

**Step 1: Write the failing test**

Adicionar um teste que garanta:

- sem `status`, a listagem retorna apenas contratos ativos;
- com `status=all`, retorna ativos e inativos.

Exemplo de estrutura:

```ts
test('contracts index supports status=all while default remains active only', async ({
  client,
  assert,
}) => {
  // seed escola + usuario autenticado + 1 contrato ativo + 1 inativo
  // GET /api/v1/contracts
  // assert: somente ativo
  // GET /api/v1/contracts?status=all
  // assert: ambos retornados
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test functional --files tests/functional/contracts/list_contracts_controller.spec.ts`
Expected: FAIL (se o caso ainda nao existir).

**Step 3: Write minimal implementation (if needed)**

Se falhar por comportamento inesperado, ajustar somente o necessario em `app/controllers/contracts/list_contracts_controller.ts` para manter:

- default: `isActive=true`
- `status=all`: sem filtro por `isActive`.

**Step 4: Run test to verify it passes**

Run: `node ace test functional --files tests/functional/contracts/list_contracts_controller.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/functional/contracts/list_contracts_controller.spec.ts app/controllers/contracts/list_contracts_controller.ts
git commit -m "test: cover contracts index status=all behavior"
```

---

### Task 2: Trazer todos os contratos na 2a etapa do formulario

**Files:**

- Modify: `inertia/containers/academic-periods/edit-academic-period-form/course-levels.tsx`

**Step 1: Write the failing test**

Criar teste de interface para o item de nivel que valide que contratos inativos aparecem quando a fonte inclui itens inativos.

Sugestao (se houver setup de teste de componente):

```ts
test('shows inactive contract indicator in level contract selector', () => {
  // render com contracts [{id:'1', name:'Ativo', isActive:true}, {id:'2', name:'Inativo', isActive:false}]
  // assert: opcao Inativo visivel com marcador visual
})
```

Se o projeto nao tiver test runner de componente pronto para esse container, manter verificacao manual detalhada na Task 4 e registrar no PR.

**Step 2: Run test to verify it fails**

Run: comando do runner de componentes do projeto (se existir).
Expected: FAIL.

**Step 3: Write minimal implementation**

No `useQuery` de contratos, trocar para:

```ts
api.api.v1.contracts.index.queryOptions({ query: { limit: 100, status: 'all' } })
```

E ajustar o tipo local de contratos para incluir `isActive`.

**Step 4: Run test to verify it passes**

Run: comando do runner de componentes (ou pular para verificacao manual da Task 4 se indisponivel).
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/academic-periods/edit-academic-period-form/course-levels.tsx
git commit -m "feat: load active and inactive contracts in period edit form"
```

---

### Task 3: Sinalizacao visual para contrato inativo

**Files:**

- Modify: `inertia/containers/academic-periods/edit-academic-period-form/course-levels.tsx`
- Reference: `inertia/components/ui/tooltip.tsx`

**Step 1: Write the failing test**

Adicionar teste que valide:

- contrato inativo no dropdown mostra `Badge`/icone de alerta;
- contrato selecionado inativo mostra alerta no gatilho do dropdown;
- tooltip com mensagem: `Esta turma esta usando um contrato cancelado/inativo`.

**Step 2: Run test to verify it fails**

Run: comando do runner de componentes (se existir).
Expected: FAIL.

**Step 3: Write minimal implementation**

Implementar no item de contrato:

- `AlertTriangle` (lucide-react) com cor amarela para inativo;
- `Badge` variante visual discreta com texto `Inativo`;
- `Tooltip` no icone com a mensagem acordada.

Importante:

- manter contratos ativos sem mudanca visual;
- nao bloquear selecao/salvamento;
- preservar layout responsivo do card.

**Step 4: Run test to verify it passes**

Run: comando do runner de componentes (se existir).
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/containers/academic-periods/edit-academic-period-form/course-levels.tsx
git commit -m "feat: warn when level uses inactive contract"
```

---

### Task 4: Verificacao final

**Files:**

- Verify: `inertia/containers/academic-periods/edit-academic-period-form/course-levels.tsx`

**Step 1: Typecheck frontend**

Run: `npm run typecheck:inertia`
Expected: PASS.

**Step 2: Manual QA do fluxo**

1. Abrir `/escola/administrativo/periodos-letivos/:id/editar`
2. Ir para etapa 2 (Series/Cursos)
3. Confirmar que contratos ativos e inativos aparecem no dropdown
4. Confirmar que inativos exibem indicador visual
5. Selecionar nivel com contrato inativo preexistente e validar tooltip de alerta
6. Salvar e confirmar que o fluxo nao bloqueia

**Step 3: (Opcional) browser test smoke**

Run: `node ace test browser --files tests/browser/escola_administrativo.spec.ts`
Expected: PASS.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: finalize inactive contract warning in academic period edit"
```
