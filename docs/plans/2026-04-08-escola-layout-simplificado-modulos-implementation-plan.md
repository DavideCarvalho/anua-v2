# Escola Layout Simplificado nos Modulos Principais Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aplicar um layout simplificado global nas paginas principais dos 6 modulos da area Escola quando `viewMode = simple`, mantendo o modo completo intacto.

**Architecture:** Vamos extrair o estado global de `viewMode` para utilitario reutilizavel e criar um layout dedicado `EscolaLayoutSimplificado`. Cada pagina principal alvo renderiza condicionalmente entre layout completo e simplificado, com conteudo "acao + lista basica" no modo simples. A ativacao permanece global e persistida por usuario em `localStorage`.

**Tech Stack:** AdonisJS, Inertia.js, React, TypeScript, Tailwind CSS, Japa Browser Tests.

---

### Task 1: Criar cobertura browser para layout simplificado nos modulos

**Files:**
- Create: `tests/browser/escola/simplified_layout_modules.spec.ts`
- Reuse helper: `tests/helpers/escola_auth.ts`

**Step 1: Write the failing test**

```ts
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Escola simplified layout across modules (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('uses simplified layout in alunos when mode is simple', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.click('button:has-text("Visão simplificada")')
    await page.click('a:has-text("Alunos")')

    await page.assertPathContains('/escola/administrativo/alunos')
    await page.assertExists('[data-testid="escola-simplified-layout"]')
    await page.assertExists('[data-testid="simplified-primary-actions"]')
    await page.assertExists('[data-testid="simplified-basic-list"]')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: FAIL por ausencia dos `data-testid` e do layout simplificado nas paginas de modulo.

**Step 3: Commit**

```bash
git add tests/browser/escola/simplified_layout_modules.spec.ts
git commit -m "test: add failing coverage for simplified layout in escola modules"
```

---

### Task 2: Extrair estado global de view mode para utilitario reutilizavel

**Files:**
- Create: `inertia/lib/escola-dashboard-view-mode.ts`
- Modify: `inertia/pages/escola/index.tsx`
- Modify: `tests/browser/escola/dashboard_view_mode.spec.ts`

**Step 1: Write the failing test**

Adicionar no `tests/browser/escola/dashboard_view_mode.spec.ts`:

```ts
test('keeps simple mode when navigating to another escola module', async ({ visit, browserContext }) => {
  const { user } = await createEscolaAuthUser()
  await browserContext.loginAs(user)

  const page = await visit('/escola')
  await page.click('button:has-text("Visão simplificada")')
  await page.click('a:has-text("Turmas")')

  await page.assertPathContains('/escola/pedagogico/turmas')
  await page.assertExists('[data-testid="escola-simplified-layout"]')
})
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: FAIL porque as outras paginas ainda nao leem o mesmo estado global.

**Step 3: Write minimal implementation**

```ts
// inertia/lib/escola-dashboard-view-mode.ts
export type EscolaDashboardViewMode = 'full' | 'simple'

const KEY_PREFIX = 'escola:dashboard:view-mode'

export function getEscolaDashboardViewModeKey(userId?: string | null) {
  return userId ? `${KEY_PREFIX}:${userId}` : null
}

export function readEscolaDashboardViewMode(userId?: string | null): EscolaDashboardViewMode {
  if (typeof window === 'undefined') return 'full'
  const key = getEscolaDashboardViewModeKey(userId)
  if (!key) return 'full'
  const value = window.localStorage.getItem(key)
  return value === 'simple' ? 'simple' : 'full'
}
```

Atualizar `inertia/pages/escola/index.tsx` para usar esse utilitario (sem alterar comportamento funcional).

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts`
Expected: PASS para cenarios existentes e novo cenario de navegacao.

**Step 5: Commit**

```bash
git add inertia/lib/escola-dashboard-view-mode.ts inertia/pages/escola/index.tsx tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "refactor: extract global escola dashboard view mode state"
```

---

### Task 3: Criar layout e shell simplificados reutilizaveis

**Files:**
- Create: `inertia/components/layouts/escola-layout-simplificado.tsx`
- Create: `inertia/components/escola/simplified-page-shell.tsx`
- Create: `inertia/components/escola/simplified-basic-list.tsx`
- Test by usage: `tests/browser/escola/simplified_layout_modules.spec.ts`

**Step 1: Write the failing test**

Expandir `tests/browser/escola/simplified_layout_modules.spec.ts` com asserts estruturais:

```ts
await page.assertExists('[data-testid="escola-simplified-layout"]')
await page.assertExists('[data-testid="simplified-page-header"]')
await page.assertExists('[data-testid="simplified-primary-actions"]')
await page.assertExists('[data-testid="simplified-basic-list"]')
```

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: FAIL porque os componentes ainda nao existem.

**Step 3: Write minimal implementation**

```tsx
// inertia/components/layouts/escola-layout-simplificado.tsx
export function EscolaLayoutSimplificado({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-testid="escola-simplified-layout" className="min-h-screen bg-background">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
    </div>
  )
}
```

```tsx
// inertia/components/escola/simplified-page-shell.tsx
export function SimplifiedPageShell({ title, actions, children }: { title: string; actions: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div data-testid="simplified-page-header" className="space-y-1">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <div data-testid="simplified-primary-actions">{actions}</div>
      {children}
    </section>
  )
}
```

```tsx
// inertia/components/escola/simplified-basic-list.tsx
export function SimplifiedBasicList({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="simplified-basic-list" className="rounded-lg border bg-card">
      {children}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: PASS nos asserts estruturais.

**Step 5: Commit**

```bash
git add inertia/components/layouts/escola-layout-simplificado.tsx inertia/components/escola/simplified-page-shell.tsx inertia/components/escola/simplified-basic-list.tsx tests/browser/escola/simplified_layout_modules.spec.ts
git commit -m "feat: add reusable simplified escola layout and page shell components"
```

---

### Task 4: Aplicar modo simplificado nas 6 paginas principais

**Files:**
- Modify: `inertia/pages/escola/administrativo/alunos.tsx`
- Modify: `inertia/pages/escola/pedagogico/turmas.tsx`
- Modify: `inertia/pages/escola/pedagogico/calendario.tsx`
- Modify: `inertia/pages/escola/financeiro/faturas.tsx`
- Modify: `inertia/pages/escola/cantina/pdv.tsx`
- Modify: `inertia/pages/escola/comunicados.tsx`
- Test: `tests/browser/escola/simplified_layout_modules.spec.ts`

**Step 1: Write the failing test**

Adicionar um teste por modulo em `tests/browser/escola/simplified_layout_modules.spec.ts` (mesmo padrao de fluxo):

```ts
const modules = [
  { label: 'Alunos', path: '/escola/administrativo/alunos' },
  { label: 'Turmas', path: '/escola/pedagogico/turmas' },
  { label: 'Calendário', path: '/escola/pedagogico/calendario' },
  { label: 'Financeiro', path: '/escola/financeiro/faturas' },
  { label: 'Cantina', path: '/escola/cantina/pdv' },
  { label: 'Comunicados', path: '/escola/comunicados' },
]
```

Validar, em cada rota, os 3 blocos do modo simplificado.

**Step 2: Run test to verify it fails**

Run: `node ace test browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: FAIL em paginas que ainda renderizam somente layout completo.

**Step 3: Write minimal implementation**

Em cada pagina listada:
- ler `viewMode` global via utilitario;
- quando `simple`, renderizar estrutura:
  - `EscolaLayoutSimplificado`
  - `SimplifiedPageShell`
  - `SimplifiedBasicList`
- manter componente atual intacto no ramo `full`.

**Step 4: Run test to verify it passes**

Run: `node ace test browser --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: PASS para os 6 modulos.

**Step 5: Commit**

```bash
git add inertia/pages/escola/administrativo/alunos.tsx inertia/pages/escola/pedagogico/turmas.tsx inertia/pages/escola/pedagogico/calendario.tsx inertia/pages/escola/financeiro/faturas.tsx inertia/pages/escola/cantina/pdv.tsx inertia/pages/escola/comunicados.tsx tests/browser/escola/simplified_layout_modules.spec.ts
git commit -m "feat: apply simplified layout to six escola module entry pages"
```

---

### Task 5: Verificacao final e regressao do modo completo

**Files:**
- Verify only (sem novos arquivos obrigatorios)

**Step 1: Run feature browser suite**

Run: `node ace test browser --files tests/browser/escola/dashboard_view_mode.spec.ts --files tests/browser/escola/simplified_layout_modules.spec.ts`
Expected: PASS em toggle/persistencia/home + modulos simplificados.

**Step 2: Run smoke browser suite**

Run: `node ace test browser --files tests/browser/dashboard_page.spec.ts --files tests/browser/escola_administrativo.spec.ts`
Expected: PASS sem regressao do modo completo.

**Step 3: Run lint and targeted typecheck**

Run: `pnpm lint`
Expected: PASS.

Run: `pnpm typecheck:inertia`
Expected: se houver falhas preexistentes globais, registrar explicitamente que sao baseline do projeto e nao dessa feature.

**Step 4: Final commit for any leftover test/docs tweaks**

```bash
git status
```

Expected: working tree limpo ou somente ajustes finais esperados antes de PR.
