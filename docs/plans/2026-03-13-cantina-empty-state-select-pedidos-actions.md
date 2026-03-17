# Cantina Empty State + Select + Pedidos Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Substituir o `CanteenContextBar` por um empty state grande em todas as telas de cantina quando não há cantina cadastrada, mostrar um select de cantina quando há mais de uma, corrigir o filtro de pedidos por cantina, e implementar o menu de ações dos pedidos.

**Architecture:**

- Criar um componente `CanteenGate` que envolve o conteúdo de cada página: se não há cantina, mostra o empty state com botão "Criar cantina" (dialog já existe); se há cantina(s), mostra o select + conteúdo normal.
- O `CanteenContextBar` atual será substituído pelo `CanteenGate` em todas as 7 páginas.
- O menu de ações dos pedidos será um `DropdownMenu` com "Marcar como Pago", "Marcar como Pendente" e "Cancelar", usando os endpoints já existentes.

**Tech Stack:** React, TanStack Query, shadcn/ui (DropdownMenu, Dialog, Select), Inertia.js, TypeScript

---

### Task 1: Criar componente `CanteenGate`

**Files:**

- Create: `inertia/components/cantina/canteen-gate.tsx`
- Modify: `inertia/components/cantina/canteen-context-bar.tsx` (manter por ora, mas a lógica de criação será reutilizada)

O `CanteenGate` deve:

1. Ler `canteens` e `canteenId` dos props do Inertia (igual ao `CanteenContextBar`)
2. Se `canteens.length === 0`: renderizar um Card grande centralizado com ícone de cantina (ex: `UtensilsCrossed` do lucide), texto "Nenhuma cantina cadastrada" + subtexto + botão "Criar cantina" que abre o Dialog de criação (mesma lógica do `CanteenContextBar`)
3. Se `canteens.length >= 1`: renderizar um Select (mostrar mesmo com só 1 cantina, para o usuário saber qual está ativa) + `{children}` abaixo
4. O Select usa `canteenId` como valor e ao mudar chama `updateUrlCanteen` (mesmo `window.location.href` do `CanteenContextBar`)
5. Ao lado do Select, manter o botão "Nova Cantina" para criar cantinas adicionais

**Step 1: Criar o arquivo `canteen-gate.tsx`**

```tsx
import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { UtensilsCrossed, Plus } from 'lucide-react'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { SharedProps } from '../../lib/types'

interface CanteenSummary {
  id: string
  name: string
  schoolId: string
  responsibleUserId: string
  createdAt?: string
}

interface PageProps extends SharedProps {
  canteenId?: string | null
  canteens?: CanteenSummary[]
}

interface CanteenGateProps {
  children: React.ReactNode
}

export function CanteenGate({ children }: CanteenGateProps) {
  const { props, url } = usePage<PageProps>()
  const queryClient = useQueryClient()
  const createCanteen = useMutation(api.api.v1.canteens.store.mutationOptions())
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCanteenName, setNewCanteenName] = useState('')

  const canteens = props.canteens ?? []
  const canteenId = props.canteenId ?? null

  const updateUrlCanteen = (nextCanteenId: string | null) => {
    if (!nextCanteenId) return
    const [path, queryString] = url.split('?')
    const params = new URLSearchParams(queryString ?? '')
    params.set('canteenId', nextCanteenId)
    window.location.href = `${path}?${params.toString()}`
  }

  const handleCreateCanteen = async () => {
    if (isCreating) return
    const schoolId = props.selectedSchoolIds[0]
    const responsibleUserId = props.user?.id
    if (!schoolId || !responsibleUserId) {
      toast.error('Não foi possível identificar escola/usuário para criar cantina')
      return
    }
    const name = newCanteenName.trim()
    if (!name) {
      toast.error('Informe um nome para a cantina')
      return
    }
    setIsCreating(true)
    try {
      const canteen = await createCanteen.mutateAsync({
        body: { name, schoolId, responsibleUserId },
      })
      queryClient.invalidateQueries({ queryKey: ['canteens'] })
      toast.success('Cantina criada com sucesso')
      setIsDialogOpen(false)
      setNewCanteenName('')
      updateUrlCanteen(canteen.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar cantina')
    } finally {
      setIsCreating(false)
    }
  }

  // Dialog de criação (reutilizado nos dois estados)
  const createDialog = (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setNewCanteenName('')
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Cantina</DialogTitle>
          <DialogDescription>Informe um nome para criar uma nova cantina.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="canteen-name">Nome</Label>
          <Input
            id="canteen-name"
            value={newCanteenName}
            onChange={(e) => setNewCanteenName(e.target.value)}
            placeholder="Ex: Cantina Principal"
            disabled={isCreating}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCanteen()
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreateCanteen} disabled={isCreating}>
            {isCreating ? 'Criando...' : 'Criar cantina'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Empty state — nenhuma cantina cadastrada
  if (canteens.length === 0) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Nenhuma cantina cadastrada</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Crie uma cantina para começar a gerenciar pedidos, cardápio e muito mais.
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Criar cantina
            </Button>
          </CardContent>
        </Card>
        {createDialog}
      </>
    )
  }

  // Tem cantina(s) — mostrar select + conteúdo
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={canteenId ?? undefined} onValueChange={updateUrlCanteen}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Selecione a cantina" />
          </SelectTrigger>
          <SelectContent>
            {canteens.map((canteen, index) => (
              <SelectItem key={canteen.id} value={canteen.id}>
                {canteen.name || `Cantina ${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Cantina
        </Button>
      </div>
      {children}
      {createDialog}
    </div>
  )
}
```

**Step 2: Verificar que o arquivo foi criado sem erros de TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep canteen-gate
```

Expected: sem erros relacionados ao arquivo

**Step 3: Commit**

```bash
git add inertia/components/cantina/canteen-gate.tsx
git commit -m "feat: add CanteenGate component with empty state and canteen select"
```

---

### Task 2: Substituir `CanteenContextBar` pelo `CanteenGate` nas 7 páginas

**Files:**

- Modify: `inertia/pages/escola/cantina/pedidos.tsx`
- Modify: `inertia/pages/escola/cantina/itens.tsx`
- Modify: `inertia/pages/escola/cantina/cardapio.tsx`
- Modify: `inertia/pages/escola/cantina/pdv.tsx`
- Modify: `inertia/pages/escola/cantina/reservas.tsx`
- Modify: `inertia/pages/escola/cantina/transferencias.tsx`
- Modify: `inertia/pages/escola/cantina/vendas.tsx`

**Padrão de mudança para cada página:**

Antes:

```tsx
import { CanteenContextBar } from '../../../components/cantina/canteen-context-bar'
// ...
<CanteenContextBar />
<ConteudoDaPagina canteenId={props.canteenId ?? undefined} />
```

Depois:

```tsx
import { CanteenGate } from '../../../components/cantina/canteen-gate'
// ...
;<CanteenGate>
  <ConteudoDaPagina canteenId={props.canteenId ?? undefined} />
</CanteenGate>
```

**Atenção para cada página:**

- `pedidos.tsx`: trocar `<CanteenContextBar />` + `<CanteenPurchasesContainer>` por `<CanteenGate><CanteenPurchasesContainer .../></CanteenGate>`
- `itens.tsx`: trocar `<CanteenContextBar />` + `<CanteenItemsContainer>` por `<CanteenGate><CanteenItemsContainer .../></CanteenGate>`
- `cardapio.tsx`: trocar `<CanteenContextBar />` + conteúdo por `<CanteenGate>conteúdo</CanteenGate>`. Remover o guard `!canteenId` inline pois o CanteenGate já bloqueia.
- `pdv.tsx`: trocar `<CanteenContextBar />` por `<CanteenGate>` envolvendo os Cards do PDV. Remover guard `!canteenId && <p>Cantina não encontrada...</p>` pois o CanteenGate já bloqueia.
- `reservas.tsx`: trocar `<CanteenContextBar />` + o ternário `{canteenId ? <Suspense>...</Suspense> : <Card>Cantina não encontrada...</Card>}` por `<CanteenGate><Suspense><MealReservationsTable .../></Suspense></CanteenGate>`
- `transferencias.tsx`: mesmo padrão do `reservas.tsx`
- `vendas.tsx`: trocar `<CanteenContextBar />` + guards por `<CanteenGate>conteúdo</CanteenGate>`

**Step 1: Editar `pedidos.tsx`**

```tsx
import { Head, usePage } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { CanteenGate } from '../../../components/cantina/canteen-gate'
import { CanteenPurchasesContainer } from '../../../containers/canteen-purchases-container'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

export default function CantinaPedidosPage() {
  const { props } = usePage<PageProps>()

  return (
    <EscolaLayout>
      <Head title="Pedidos da Cantina" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie os pedidos da cantina</p>
        </div>
        <CanteenGate>
          <CanteenPurchasesContainer canteenId={props.canteenId ?? undefined} />
        </CanteenGate>
      </div>
    </EscolaLayout>
  )
}
```

**Step 2: Editar `itens.tsx`** — mesmo padrão com `CanteenItemsContainer`

**Step 3: Editar `cardapio.tsx`** — ler o arquivo primeiro, aplicar o padrão

**Step 4: Editar `pdv.tsx`** — ler o arquivo, envolver os Cards do PDV com `<CanteenGate>`, remover o guard `!canteenId && <p>` interno

**Step 5: Editar `reservas.tsx`** — substituir o ternário pelo `<CanteenGate>`

**Step 6: Editar `transferencias.tsx`** — mesmo padrão do reservas

**Step 7: Editar `vendas.tsx`** — ler o arquivo, aplicar o padrão

**Step 8: Verificar sem erros de tipo**

```bash
npx tsc --noEmit 2>&1 | grep -E "(cantina|canteen)"
```

Expected: sem erros

**Step 9: Commit**

```bash
git add inertia/pages/escola/cantina/
git commit -m "feat: replace CanteenContextBar with CanteenGate across all cantina pages"
```

---

### Task 3: Corrigir filtro de pedidos — não buscar quando sem canteenId

**Files:**

- Modify: `inertia/containers/canteen-purchases-container.tsx:110-114`
- Modify: `app/controllers/canteen_purchases/list_canteen_purchases_controller.ts:12-20`

**Problema:** quando `canteenId` é `undefined/null`, a query roda e retorna TODOS os pedidos do sistema.

**Fix frontend** — adicionar `enabled: !!canteenId` na query:

```tsx
// canteen-purchases-container.tsx linha ~110
const { data, isLoading, error, refetch } = useQuery({
  ...api.api.v1.canteenPurchases.index.queryOptions({
    query: { page, limit, canteenId, search: search || undefined },
  }),
  enabled: !!canteenId,
})
```

**Fix backend** — tornar o `canteenId` obrigatório na query (ou retornar vazio se não fornecido):

No `list_canteen_purchases_controller.ts`, adicionar no topo da query:

```ts
// Se não veio canteenId, retornar vazio (segurança — nunca vazar pedidos de todas escolas)
if (!canteenId) {
  return serialize(
    CanteenPurchaseTransformer.paginate([], {
      total: 0,
      perPage: limit,
      currentPage: page,
      lastPage: 1,
      firstPage: 1,
      firstPageUrl: '',
      lastPageUrl: '',
      nextPageUrl: null,
      previousPageUrl: null,
    })
  )
}
```

Alternativamente (mais limpo), usar o paginator vazio do Lucid. Verificar como outros controllers fazem isso no projeto antes de implementar.

**Step 1: Ler o controller list para ver o padrão de paginação vazio**

Verificar `app/controllers/canteen_purchases/list_canteen_purchases_controller.ts` e outros controllers similares para entender como retornar resultado paginado vazio.

**Step 2: Editar `canteen-purchases-container.tsx` — adicionar `enabled: !!canteenId`**

Localizar linha 110-114 e trocar `useQuery(...)` pelo formato com `enabled`.

**Step 3: Editar `list_canteen_purchases_controller.ts` — guard sem canteenId**

Adicionar early return antes de montar a query quando `canteenId` não está presente.

**Step 4: Commit**

```bash
git add inertia/containers/canteen-purchases-container.tsx
git add app/controllers/canteen_purchases/list_canteen_purchases_controller.ts
git commit -m "fix: guard canteen purchases query to require canteenId"
```

---

### Task 4: Implementar menu de ações dos pedidos (DropdownMenu)

**Files:**

- Modify: `inertia/containers/canteen-purchases-container.tsx:195-199`

O botão stub `<Button variant="ghost"><MoreHorizontal /></Button>` deve virar um `DropdownMenu` com três ações:

1. **"Marcar como Pago"** — chama `POST /api/v1/canteen-purchases/:id/status` com `{ status: 'PAID' }`. Só aparece se `purchase.status !== 'PAID'`.
2. **"Marcar como Pendente"** — chama `POST /api/v1/canteen-purchases/:id/status` com `{ status: 'PENDING' }`. Só aparece se `purchase.status !== 'PENDING'`.
3. **"Cancelar pedido"** — chama `POST /api/v1/canteen-purchases/:id/cancel`. Só aparece se `purchase.status !== 'CANCELLED'`. Deve ter um `AlertDialog` de confirmação antes de executar.

Após cada ação bem-sucedida: `toast.success(...)` + invalidar query de pedidos para refetch automático.

**Step 1: Verificar as rotas da API para as ações**

Confirmar os endpoints exatos em `start/routes/api/canteen.ts` para status e cancel.

**Step 2: Verificar tipos da API gerados pelo Tuyau**

As mutations precisam usar `api.api.v1.canteenPurchases.*` — verificar quais keys existem:

- Provavelmente: `api.api.v1.canteenPurchases.status.mutationOptions()` ou similar
- Verificar em `inertia/lib/api.ts` ou o arquivo de types gerado

**Step 3: Adicionar imports no container**

```tsx
// Adicionar aos imports existentes:
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Clock, Trash2 } from 'lucide-react'
```

**Step 4: Criar componente `PurchaseActionsMenu` dentro do arquivo**

```tsx
function PurchaseActionsMenu({ purchase }: { purchase: CanteenPurchase }) {
  const queryClient = useQueryClient()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const updateStatus = useMutation({
    ...api.api.v1.canteenPurchases.status.mutationOptions(), // ajustar key conforme Tuyau
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteenPurchases'] }) // ajustar queryKey
      toast.success('Status atualizado')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status')
    },
  })

  const cancelPurchase = useMutation({
    ...api.api.v1.canteenPurchases.cancel.mutationOptions(), // ajustar key conforme Tuyau
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteenPurchases'] }) // ajustar queryKey
      toast.success('Pedido cancelado')
      setCancelDialogOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar pedido')
      setCancelDialogOpen(false)
    },
  })

  const isCancelled = purchase.status === 'CANCELLED'
  const isPaid = purchase.status === 'PAID'
  const isPending = purchase.status === 'PENDING'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isPaid && (
            <DropdownMenuItem
              onClick={() =>
                updateStatus.mutate({ params: { id: purchase.id }, body: { status: 'PAID' } })
              }
              disabled={updateStatus.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Marcar como Pago
            </DropdownMenuItem>
          )}
          {!isPending && (
            <DropdownMenuItem
              onClick={() =>
                updateStatus.mutate({ params: { id: purchase.id }, body: { status: 'PENDING' } })
              }
              disabled={updateStatus.isPending}
            >
              <Clock className="h-4 w-4 mr-2 text-yellow-600" />
              Marcar como Pendente
            </DropdownMenuItem>
          )}
          {!isCancelled && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCancelDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar pedido
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá cancelar o pedido #{purchase.id.slice(0, 8)}.
              {/* Se pago via saldo, o reembolso é automático no backend */}
              Se o pagamento foi feito via saldo, o valor será estornado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelPurchase.mutate({ params: { id: purchase.id } })}
              disabled={cancelPurchase.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelPurchase.isPending ? 'Cancelando...' : 'Cancelar pedido'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

**IMPORTANTE:** Os mutation keys (`api.api.v1.canteenPurchases.status` e `api.api.v1.canteenPurchases.cancel`) e os parâmetros exatos (`params`, `body`) precisam ser verificados nos types gerados pelo Tuyau antes de implementar. Ver `start/routes/api/canteen.ts` linhas 168–181 para os nomes das rotas.

**Step 5: Substituir o stub no JSX da tabela**

Trocar:

```tsx
<td className="p-4 text-right">
  <Button variant="ghost" size="sm">
    <MoreHorizontal className="h-4 w-4" />
  </Button>
</td>
```

Por:

```tsx
<td className="p-4 text-right">
  <PurchaseActionsMenu purchase={purchase} />
</td>
```

**Step 6: Verificar que DropdownMenu e AlertDialog estão instalados**

```bash
ls inertia/components/ui/dropdown-menu.tsx inertia/components/ui/alert-dialog.tsx
```

Se não existirem, instalar:

```bash
npx shadcn@latest add dropdown-menu alert-dialog
```

**Step 7: Verificar keys da API Tuyau para as mutations de status e cancel**

```bash
grep -r "canteen.purchases\|canteenPurchases" start/routes/api/canteen.ts
```

Ajustar os `mutationOptions()` conforme o nome das rotas.

**Step 8: Verificar queryKey correto para invalidação**

O `useQuery` de pedidos usa `api.api.v1.canteenPurchases.index.queryOptions(...)` — o Tuyau gera uma queryKey automática. Para invalidar corretamente:

```tsx
// Após mutation bem-sucedida, invalidar usando a mesma base do Tuyau:
queryClient.invalidateQueries({
  queryKey: api.api.v1.canteenPurchases.index.queryOptions({ query: {} }).queryKey.slice(0, -1),
})
// Ou simplesmente invalidar tudo que começa com a rota:
queryClient.invalidateQueries({ queryKey: ['/api/v1/canteen-purchases'] })
```

Verificar como outros containers invalidam queries no projeto para seguir o mesmo padrão.

**Step 9: Verificar sem erros TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep canteen-purchases-container
```

**Step 10: Commit**

```bash
git add inertia/containers/canteen-purchases-container.tsx
git commit -m "feat: implement purchase actions dropdown with status update and cancel"
```

---

### Task 5: Verificação final

**Step 1: Build completo**

```bash
npm run build 2>&1 | tail -20
```

Expected: sem erros

**Step 2: Verificar TypeScript geral**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 erros novos introduzidos

**Step 3: Commit final se necessário**

```bash
git status
```

Se houver arquivos soltos, commitar.
