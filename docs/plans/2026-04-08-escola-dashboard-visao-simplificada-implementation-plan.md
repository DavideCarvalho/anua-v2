# Escola Dashboard Visao Simplificada Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar um modo alternavel no dashboard da escola com um hub simplificado de 6 acoes diretas, mantendo o dashboard completo intacto.

**Architecture:** A implementacao fica na rota existente `web.escola.dashboard` e alterna entre dois modos de renderizacao (`full` e `simple`) no frontend. A preferencia de modo e persistida por usuario via `localStorage`, e o hub simplificado usa uma configuracao tipada de acoes com filtros por permissao/role antes da renderizacao.

**Tech Stack:** AdonisJS + Inertia.js + React + TypeScript + Tailwind CSS + Japa Browser Tests.

---

### Task 1: Cobrir o comportamento alvo com teste browser (falhando primeiro)

**Files:**

- Create: `tests/browser/escola/dashboard_view_mode.spec.ts`
- Test helper reuse: `tests/helpers/escola_auth.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Escola dashboard view mode (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('switches to simple mode and shows the 6 quick actions', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')

    await page.assertExists('h1:has-text("O que você quer fazer agora?")')
    await page.assertExists('a:has-text("Alunos")')
    await page.assertExists('a:has-text("Turmas")')
    await page.assertExists('a:has-text("Calendário")')
    await page.assertExists('a:has-text("Financeiro")')
    await page.assertExists('a:has-text("Cantina")')
    await page.assertExists('a:has-text("Comunicados")')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: FAIL com erro de seletor ausente para o toggle e/ou titulo da visao simplificada.

**Step 3: Commit**

```bash
git add tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "test: add failing browser coverage for escola dashboard simple mode"
```

---

### Task 2: Criar estado de modo e persistencia por usuario (TDD minimo)

**Files:**

- Create: `inertia/components/dashboard/escola-dashboard-view-toggle.tsx`
- Create: `inertia/components/dashboard/escola-dashboard-view-mode.storage.ts`
- Modify: `inertia/pages/escola/index.tsx`

**Step 1: Write the failing test**

Adicione no mesmo arquivo `tests/browser/escola/dashboard_view_mode.spec.ts`:

```ts
test('persists selected view mode after reload', async ({ visit, browserContext }) => {
  const { user } = await createEscolaAuthUser()
  await browserContext.loginAs(user)

  const page = await visit('/escola')
  await page.click('button:has-text("Visão simplificada")')
  await page.reload()

  await page.assertExists('h1:has-text("O que você quer fazer agora?")')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: FAIL porque o estado volta para modo completo apos reload.

**Step 3: Write minimal implementation**

```ts
// inertia/components/dashboard/escola-dashboard-view-mode.storage.ts
export type EscolaDashboardViewMode = 'full' | 'simple'

export function getEscolaDashboardViewModeStorageKey(userId: string) {
  return `escola:dashboard:view-mode:${userId}`
}

export function readEscolaDashboardViewMode(userId: string): EscolaDashboardViewMode {
  if (typeof window === 'undefined') return 'full'
  const raw = window.localStorage.getItem(getEscolaDashboardViewModeStorageKey(userId))
  return raw === 'simple' ? 'simple' : 'full'
}

export function writeEscolaDashboardViewMode(userId: string, mode: EscolaDashboardViewMode) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getEscolaDashboardViewModeStorageKey(userId), mode)
}
```

```tsx
// inertia/components/dashboard/escola-dashboard-view-toggle.tsx
type Props = {
  value: 'full' | 'simple'
  onChange: (mode: 'full' | 'simple') => void
}

export function EscolaDashboardViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <button type="button" onClick={() => onChange('full')}>
        Visão completa
      </button>
      <button type="button" onClick={() => onChange('simple')}>
        Visão simplificada
      </button>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS no teste de persistencia.

**Step 5: Commit**

```bash
git add inertia/components/dashboard/escola-dashboard-view-mode.storage.ts inertia/components/dashboard/escola-dashboard-view-toggle.tsx inertia/pages/escola/index.tsx tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "feat: add view mode toggle and per-user persistence on escola dashboard"
```

---

### Task 3: Implementar hub simplificado com configuracao das 6 acoes

**Files:**

- Create: `inertia/components/dashboard/escola-quick-actions-config.ts`
- Create: `inertia/components/dashboard/escola-quick-actions-hub.tsx`
- Modify: `inertia/pages/escola/index.tsx`

**Step 1: Write the failing test**

Extenda `tests/browser/escola/dashboard_view_mode.spec.ts`:

```ts
test('navigates to alunos from quick actions hub', async ({ visit, browserContext }) => {
  const { user } = await createEscolaAuthUser()
  await browserContext.loginAs(user)

  const page = await visit('/escola')
  await page.click('button:has-text("Visão simplificada")')
  await page.click('a:has-text("Alunos")')

  await page.assertPathContains('/escola/administrativo/alunos')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: FAIL porque o link ainda nao existe no hub.

**Step 3: Write minimal implementation**

```ts
// inertia/components/dashboard/escola-quick-actions-config.ts
import type { SharedProps } from '~/lib/types'

export type EscolaQuickAction = {
  label: 'Alunos' | 'Turmas' | 'Calendário' | 'Financeiro' | 'Cantina' | 'Comunicados'
  route: string
  isVisible: (ctx: { roleName?: string }) => boolean
}

export const ESCOLA_QUICK_ACTIONS: EscolaQuickAction[] = [
  { label: 'Alunos', route: '/escola/administrativo/alunos', isVisible: () => true },
  { label: 'Turmas', route: '/escola/pedagogico/turmas', isVisible: () => true },
  { label: 'Calendário', route: '/escola/pedagogico/calendario', isVisible: () => true },
  {
    label: 'Financeiro',
    route: '/escola/financeiro/faturas',
    isVisible: ({ roleName }) => roleName !== 'SCHOOL_TEACHER',
  },
  { label: 'Cantina', route: '/escola/cantina/pdv', isVisible: () => true },
  { label: 'Comunicados', route: '/escola/comunicados', isVisible: () => true },
]
```

```tsx
// inertia/components/dashboard/escola-quick-actions-hub.tsx
import { Link } from '@adonisjs/inertia/react'
import { ESCOLA_QUICK_ACTIONS } from './escola-quick-actions-config'

export function EscolaQuickActionsHub({ roleName }: { roleName?: string }) {
  const actions = ESCOLA_QUICK_ACTIONS.filter((action) => action.isVisible({ roleName }))

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 py-8">
      <h1 className="text-2xl font-semibold">O que você quer fazer agora?</h1>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.route}
            className="rounded-xl border p-6 text-lg font-medium"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS no teste de navegacao do botao `Alunos`.

**Step 5: Commit**

```bash
git add inertia/components/dashboard/escola-quick-actions-config.ts inertia/components/dashboard/escola-quick-actions-hub.tsx inertia/pages/escola/index.tsx tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "feat: add escola quick actions hub with six fixed actions"
```

---

### Task 4: Garantir regressao zero no modo completo

**Files:**

- Modify: `tests/browser/escola/dashboard_view_mode.spec.ts`
- Modify: `inertia/pages/escola/index.tsx`

**Step 1: Write the failing test**

```ts
test('returns to full mode and shows dashboard tabs', async ({ visit, browserContext }) => {
  const { user } = await createEscolaAuthUser()
  await browserContext.loginAs(user)

  const page = await visit('/escola')
  await page.click('button:has-text("Visão simplificada")')
  await page.click('button:has-text("Visão completa")')

  await page.assertExists('button:has-text("Pedagógico")')
  await page.assertExists('button:has-text("Administrativo")')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: FAIL se a alternancia de volta nao restaurar a interface completa.

**Step 3: Write minimal implementation**

No `inertia/pages/escola/index.tsx`, extraia o bloco atual do dashboard para uma funcao/componente interno e renderize por condicao:

```tsx
{
  viewMode === 'simple' ? (
    <EscolaQuickActionsHub roleName={roleName} />
  ) : (
    <FullEscolaDashboard /* props existentes */ />
  )
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS para alternancia ida/volta.

**Step 5: Commit**

```bash
git add inertia/pages/escola/index.tsx tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "refactor: preserve full escola dashboard when toggling view modes"
```

---

### Task 5: Verificacao final de qualidade

**Files:**

- No file changes required (verification only)

**Step 1: Run focused browser tests**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS (todos os cenarios do modo simplificado e retorno ao completo).

**Step 2: Run smoke browser regression**

Run: `node ace test browser --files tests/browser/dashboard_page.spec.ts --files tests/browser/escola_administrativo.spec.ts`
Expected: PASS (nao quebrar fluxo base de dashboard e acesso administrativo).

**Step 3: Run static checks**

Run: `pnpm lint && pnpm typecheck:inertia`
Expected: PASS sem erros novos.

**Step 4: Commit verification notes (if docs updated)**

```bash
git status
```

Expected: working tree limpo ou somente alteracoes esperadas desta feature.
