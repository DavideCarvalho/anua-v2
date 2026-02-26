# Gamificação Tabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar sub-itens ao menu de Gamificação no sidebar e criar página de Desafios

**Architecture:** Já existem as páginas e containers. Precisa apenas adicionar navegação no sidebar e criar página de Desafios baseada no modelo Challenge existente.

**Tech Stack:** React, Inertia, TanStack Query, Lucide Icons

---

## Overview

O código já tem as páginas e containers implementados:

- `/escola/gamificacao/rankings` - Rankings (funcionando)
- `/escola/gamificacao/conquistas` - Conquistas (precisa verificar)
- `/escola/gamificacao/recompensas` - Itens + Pedidos (precisa verificar)

Falta:

1. Sidebar com sub-itens (Rankings, Conquistas, Recompensas)
2. Página de Desafios (não existe ainda)
3. Página principal /gamificacao pode ter overview ou redirecionar

---

## Task 1: Adicionar sub-itens ao menu Gamificação no sidebar

**Arquivo:**

- Modificar: `inertia/components/layouts/escola-layout.tsx` (linhas ~170-174)

**Step 1: Editar o item Gamificação no sidebar para ter children**

```tsx
// Mudar de:
{
  title: 'Gamificação',
  route: 'web.escola.gamificacao.index',
  href: '/escola/gamificacao',
  icon: Trophy,
},

// Para:
{
  title: 'Gamificação',
  route: 'web.escola.gamificacao.index',
  href: '/escola/gamificacao',
  icon: Trophy,
  children: [
    { title: 'Rankings', route: 'web.escola.gamificacao.rankings', href: '/escola/gamificacao/rankings' },
    { title: 'Conquistas', route: 'web.escola.gamificacao.conquistas', href: '/escola/gamificacao/conquistas' },
    { title: 'Recompensas', route: 'web.escola.gamificacao.recompensas', href: '/escola/gamificacao/recompensas' },
  ],
},
```

**Step 2: Verificar se a renderização de children funciona**

Rodar: `curl -s http://localhost:3333/escola/gamificacao/rankings` e verificar se carrega

**Step 3: Commit**

```bash
git add inertia/components/layouts/escola-layout.tsx
git commit -m "feat: add sub-items to Gamificação sidebar menu"
```

---

## Task 2: Criar página de Desafios

**Arquivo:**

- Criar: `inertia/pages/escola/gamificacao/desafios.tsx`
- Criar: `inertia/containers/gamificacao/challenges-table.tsx`
- Criar: `app/controllers/pages/escola/show_gamificacao_desafios_page_controller.ts`
- Modificar: `start/routes/pages/escola.ts` (adicionar rota)
- Criar: `inertia/hooks/queries/use_challenges.ts`
- Criar: `inertia/hooks/mutations/use_challenge_mutations.ts`

**Step 1: Verificar modelo Challenge existente**

Rodar: `cat app/models/challenge.ts` para ver os campos

**Step 2: Criar challenges-table container**

Criar `inertia/containers/gamificacao/challenges-table.tsx` baseado em `achievements-table.tsx` como referência

**Step 3: Criar página de desafios**

Criar `inertia/pages/escola/gamificacao/desafios.tsx` baseado em `conquistas.tsx`:

```tsx
import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { Target } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { ChallengesTable } from '../../../containers/gamificacao/challenges-table'

export default function DesafiosPage() {
  return (
    <EscolaLayout>
      <Head title="Desafios" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6" />
          Desafios
        </h1>
        <Suspense fallback={<div>Carregando...</div>}>
          <ChallengesTable />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
```

**Step 4: Criar controller**

Criar `app/controllers/pages/escola/show_gamificacao_desafios_page_controller.ts`

**Step 5: Registrar rota**

Adicionar em `start/routes/pages/escola.ts`:

```ts
import('#controllers/pages/escola/show_gamificacao_desafios_page_controller')

  // No grupo de gamificação:
  .get('/gamificacao/desafios', [ShowGamificacaoDesafiosPageController])
  .as('gamificacao.desafios')
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add desafios page for gamification challenges"
```

---

## Task 3: Adicionar Desafios ao sidebar

**Arquivo:**

- Modificar: `inertia/components/layouts/escola-layout.tsx`

**Step 1: Adicionar Desafios aos children do menu Gamificação**

```tsx
children: [
  { title: 'Rankings', route: 'web.escola.gamificacao.rankings', href: '/escola/gamificacao/rankings' },
  { title: 'Conquistas', route: 'web.escola.gamificacao.conquistas', href: '/escola/gamificacao/conquistas' },
  { title: 'Recompensas', route: 'web.escola.gamificacao.recompensas', href: '/escola/gamificacao/recompensas' },
  { title: 'Desafios', route: 'web.escola.gamificacao.desafios', href: '/escola/gamificacao/desafios' },
],
```

**Step 2: Commit**

```bash
git add inertia/components/layouts/escola-layout.tsx
git commit -m "feat: add Desafios to Gamificação sidebar menu"
```

---

## Task 4: Verificar se páginas estão funcionando (dogfood)

**Step 1: Acessar /escola/gamificacao/rankings**

Navegar no browser e verificar se rankings carregam

**Step 2: Acessar /escola/gamificacao/conquistas**

Verificar se conquistas carregam

**Step 3: Acessar /escola/gamificacao/recompensas**

Verificar se recompensas (Itens + Pedidos) carregam

**Step 4: Acessar /escola/gamificacao/desafios**

Verificar se desafios carregam (após Task 2)

---

## Verification Commands

Após implementar:

```bash
# Verificar se rotas existem
curl -s http://localhost:3333/escola/gamificacao/rankings | head -20
curl -s http://localhost:3333/escola/gamificacao/conquistas | head -20
curl -s http://localhost:3333/escola/gamificacao/recompensas | head -20
curl -s http://localhost:3333/escola/gamificacao/desafios | head -20

# Verificar TypeScript
npx tsc --noEmit
```
