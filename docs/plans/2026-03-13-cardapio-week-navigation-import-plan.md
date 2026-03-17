# Cardápio — Navegação de Semanas + Importar Refeição Passada

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar navegação entre semanas (setas + botão Hoje) e combobox para importar refeição passada no modal de criar/editar na tela `/escola/cantina/cardapio`.

**Architecture:** Mudança puramente frontend em `cardapio.tsx`. Estado `weekOffset` controla a semana exibida. Combobox no `MealForm` busca refeições passadas da mesma cantina e preenche os campos ao selecionar.

**Tech Stack:** React, TanStack Query, date-fns, Radix UI (Popover + Command — padrão do projeto), shadcn/ui

---

### Task 1: Navegação entre semanas

**Files:**

- Modify: `inertia/pages/escola/cantina/cardapio.tsx`

Sem testes automatizados para este task (UI pura). Verificar manualmente no browser.

**Step 1: Adicionar import de `addWeeks` e `ChevronLeft`/`ChevronRight`**

No topo de `cardapio.tsx`, atualizar os imports:

```tsx
// date-fns: adicionar addWeeks
import { addDays, addWeeks, format, startOfWeek } from 'date-fns'

// lucide-react: adicionar ChevronLeft, ChevronRight
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
```

**Step 2: Adicionar estado `weekOffset` e recalcular `weekStart`**

Substituir a linha que calcula `weekStart` (linha 94) e o `useMemo` de `weekDays` (linhas 95–98):

```tsx
// ANTES (remover):
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
const weekDays = useMemo(
  () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
  [weekStart]
)

// DEPOIS (adicionar logo após os useState existentes):
const [weekOffset, setWeekOffset] = useState(0)

const weekStart = useMemo(
  () => addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset),
  [weekOffset]
)

const weekDays = useMemo(
  () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
  [weekStart]
)
```

**Step 3: Substituir o `CardHeader` do calendário**

Localizar o bloco `<CardHeader>` dentro do `<Card>` principal (por volta da linha 264) e substituir:

```tsx
// ANTES:
<CardHeader>
  <div className="flex items-center gap-2">
    <Calendar className="h-5 w-5 text-primary" />
    <CardTitle>Semana Atual</CardTitle>
  </div>
  <CardDescription>
    {format(weekDays[0], 'dd/MM/yyyy')} - {format(weekDays[4], 'dd/MM/yyyy')}
  </CardDescription>
</CardHeader>

// DEPOIS:
<CardHeader>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-primary" />
      <CardTitle>
        {weekOffset === 0
          ? 'Semana Atual'
          : weekOffset < 0
            ? `${Math.abs(weekOffset)} semana${Math.abs(weekOffset) > 1 ? 's' : ''} atrás`
            : `${weekOffset} semana${weekOffset > 1 ? 's' : ''} à frente`}
      </CardTitle>
    </div>
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setWeekOffset((w) => w - 1)}
        aria-label="Semana anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {weekOffset !== 0 && (
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
          Hoje
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setWeekOffset((w) => w + 1)}
        aria-label="Próxima semana"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
  <CardDescription>
    {format(weekDays[0], 'dd/MM/yyyy')} – {format(weekDays[4], 'dd/MM/yyyy')}
  </CardDescription>
</CardHeader>
```

**Step 4: Verificar no browser**

- Abrir `http://localhost:3333/escola/cantina/cardapio`
- Clicar `>` — semana avança, datas mudam no header
- Clicar `<` — semana volta
- Quando `weekOffset !== 0`, botão "Hoje" aparece; clicar volta para semana atual
- Refeições cadastradas em outras semanas aparecem corretamente

**Step 5: Commit**

```bash
git add inertia/pages/escola/cantina/cardapio.tsx
git commit -m "feat(cardapio): adicionar navegação entre semanas com offset"
```

---

### Task 2: Combobox "Importar refeição passada" no `MealForm`

**Files:**

- Modify: `inertia/pages/escola/cantina/cardapio.tsx`

**Step 1: Adicionar imports necessários**

```tsx
// Adicionar aos imports existentes:
import { useDebounce } from '../../../hooks/use_debounce'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command'
import { ChevronsUpDown } from 'lucide-react'
```

> `use_debounce` já existe em `inertia/hooks/use_debounce.ts` (criado na feature anterior).
> `Popover` e `Command` já existem no projeto (usados em `canteen-gate.tsx`).

**Step 2: Atualizar a assinatura do `MealForm`**

```tsx
// ANTES:
function MealForm({
  form,
  setForm,
}: {
  form: MealFormValues
  setForm: React.Dispatch<React.SetStateAction<MealFormValues>>
})

// DEPOIS:
function MealForm({
  form,
  setForm,
  canteenId,
}: {
  form: MealFormValues
  setForm: React.Dispatch<React.SetStateAction<MealFormValues>>
  canteenId?: string | null
})
```

**Step 3: Adicionar estado e query do combobox dentro de `MealForm`**

Logo no início do corpo da função `MealForm`, antes do `return`:

```tsx
const [importOpen, setImportOpen] = useState(false)
const [importSearch, setImportSearch] = useState('')
const debouncedSearch = useDebounce(importSearch, 300)

const { data: importData } = useQuery({
  ...api.api.v1.canteenMeals.index.queryOptions({
    query: {
      canteenId: canteenId ?? undefined,
      limit: 20,
      isActive: true,
    },
  }),
  enabled: !!canteenId && importOpen,
})

const importMeals = ((importData as PaginatorLike<CanteenMeal> | undefined)?.data ?? []).filter(
  (m) => debouncedSearch.length < 2 || m.name.toLowerCase().includes(debouncedSearch.toLowerCase())
)

const handleImport = (meal: CanteenMeal) => {
  setForm((prev) => ({
    ...prev,
    name: meal.name,
    description: meal.description ?? '',
    priceReais: (meal.price / 100).toFixed(2),
  }))
  setImportOpen(false)
  setImportSearch('')
}
```

**Step 4: Adicionar o combobox no JSX do `MealForm`**

Inserir logo no início do `<div className="space-y-4">`, antes do campo "Nome":

```tsx
{
  canteenId && (
    <div className="space-y-1">
      <Label>Importar de refeição anterior (opcional)</Label>
      <Popover open={importOpen} onOpenChange={setImportOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
            <span className="text-muted-foreground">Buscar por nome...</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar refeição..."
              value={importSearch}
              onValueChange={setImportSearch}
            />
            <CommandList>
              <CommandEmpty>
                {importSearch.length < 2
                  ? 'Digite ao menos 2 caracteres'
                  : 'Nenhuma refeição encontrada'}
              </CommandEmpty>
              {importMeals.length > 0 && (
                <CommandGroup>
                  {importMeals.map((meal) => (
                    <CommandItem key={meal.id} value={meal.id} onSelect={() => handleImport(meal)}>
                      <span className="flex-1">{meal.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatCurrency(meal.price)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

**Step 5: Passar `canteenId` para ambas as chamadas de `MealForm`**

No modal de criar:

```tsx
// ANTES:
<MealForm form={createForm} setForm={setCreateForm} />
// DEPOIS:
<MealForm form={createForm} setForm={setCreateForm} canteenId={canteenId} />
```

No modal de editar:

```tsx
// ANTES:
<MealForm form={editForm} setForm={setEditForm} />
// DEPOIS:
<MealForm form={editForm} setForm={setEditForm} canteenId={canteenId} />
```

**Step 6: Verificar no browser**

- Abrir modal "Nova Refeição"
- Combobox "Importar de refeição anterior" aparece no topo
- Digitar 2+ chars → lista filtra por nome
- Selecionar refeição → campos nome, descrição, preço são preenchidos
- Usuário pode editar os campos antes de salvar
- Mesmo comportamento no modal "Editar Refeição"

**Step 7: Commit**

```bash
git add inertia/pages/escola/cantina/cardapio.tsx
git commit -m "feat(cardapio): adicionar combobox para importar refeição passada no modal"
```
