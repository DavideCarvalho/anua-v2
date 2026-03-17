# CurrencyInput Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar um componente `CurrencyInput` reutilizável que funciona como o input de valor do Nubank/Pix — push-from-right em centavos — e substituir o `<Input>` de preço no `canteen-items-container.tsx`.

**Architecture:** Componente controlado que recebe `value: number` (centavos) e emite `onChange(cents: number)`. Mantém estado interno de dígitos (string), formata com `Intl.NumberFormat` pt-BR. O container passa a usar `price: number` diretamente no form state, eliminando `parsePriceToCents` e `priceReais`.

**Tech Stack:** React, TypeScript, shadcn/ui `<Input>`, `Intl.NumberFormat`

---

### Task 1: Criar o componente `CurrencyInput`

**Files:**

- Create: `inertia/components/ui/currency-input.tsx`

**Step 1: Criar o arquivo com a implementação completa**

```tsx
import { useEffect, useState } from 'react'
import { cn } from '~/lib/utils'
import { Input } from './input'

interface CurrencyInputProps {
  value: number
  onChange: (cents: number) => void
  id?: string
  disabled?: boolean
  className?: string
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function CurrencyInput({ value, onChange, id, disabled, className }: CurrencyInputProps) {
  const [digits, setDigits] = useState(() => (value > 0 ? String(value) : ''))

  // Sync externa: se value mudar de fora (ex: ao abrir o edit dialog)
  useEffect(() => {
    setDigits(value > 0 ? String(value) : '')
  }, [value])

  const displayValue = digits.length > 0 ? formatCents(Number(digits)) : formatCents(0)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = digits.slice(0, -1)
      setDigits(next)
      onChange(next.length > 0 ? Number(next) : 0)
      return
    }
    if (e.key === 'Delete') {
      e.preventDefault()
      setDigits('')
      onChange(0)
      return
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Filtra só dígitos do que foi colado/digitado
    const raw = e.target.value.replace(/\D/g, '')
    // Limita a 7 dígitos: max R$ 99.999,99
    const next = raw.slice(0, 7)
    setDigits(next)
    onChange(next.length > 0 ? Number(next) : 0)
  }

  return (
    <Input
      id={id}
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn('tabular-nums', className)}
    />
  )
}
```

**Step 2: Verificar que o arquivo foi criado corretamente**

Abrir `inertia/components/ui/currency-input.tsx` e confirmar que está correto.

**Step 3: Commit**

```bash
git add inertia/components/ui/currency-input.tsx
git commit -m "feat: add CurrencyInput component with push-from-right mask"
```

---

### Task 2: Migrar `canteen-items-container.tsx` para usar `CurrencyInput`

**Files:**

- Modify: `inertia/containers/canteen-items-container.tsx`

**Step 1: Adicionar import do `CurrencyInput`**

Adicionar após os imports de `Command`:

```tsx
import { CurrencyInput } from '../components/ui/currency-input'
```

**Step 2: Alterar `ItemFormValues` — trocar `priceReais: string` por `price: number`**

```ts
// antes
interface ItemFormValues {
  name: string
  description: string
  category: string
  priceReais: string
  isActive: boolean
  imagePreviewUrl: string | null
  removeImage: boolean
}

// depois
interface ItemFormValues {
  name: string
  description: string
  category: string
  price: number
  isActive: boolean
  imagePreviewUrl: string | null
  removeImage: boolean
}
```

**Step 3: Alterar `defaultItemForm` — trocar `priceReais: ''` por `price: 0`**

```ts
// antes
const defaultItemForm: ItemFormValues = {
  name: '',
  description: '',
  category: '',
  priceReais: '',
  isActive: true,
  imagePreviewUrl: null,
  removeImage: false,
}

// depois
const defaultItemForm: ItemFormValues = {
  name: '',
  description: '',
  category: '',
  price: 0,
  isActive: true,
  imagePreviewUrl: null,
  removeImage: false,
}
```

**Step 4: Remover a função `parsePriceToCents`**

Deletar as linhas:

```ts
function parsePriceToCents(priceReais: string) {
  const normalized = Number(priceReais.replace(',', '.'))
  if (!Number.isFinite(normalized) || normalized < 0) {
    return null
  }
  return Math.round(normalized * 100)
}
```

**Step 5: Atualizar `openEditDialog` — trocar `priceReais` por `price`**

```ts
// antes
priceReais: (item.price / 100).toFixed(2),

// depois
price: item.price,
```

**Step 6: Atualizar `canSaveCreate` — trocar verificação de `priceReais` por `price`**

```ts
// antes
const canSaveCreate = useMemo(() => {
  return (
    !!createForm.name.trim() && parsePriceToCents(createForm.priceReais) !== null && !!canteenId
  )
}, [createForm.name, createForm.priceReais, canteenId])

// depois
const canSaveCreate = useMemo(() => {
  return !!createForm.name.trim() && createForm.price > 0 && !!canteenId
}, [createForm.name, createForm.price, canteenId])
```

**Step 7: Atualizar `canSaveEdit` — trocar verificação de `priceReais` por `price`**

```ts
// antes
const canSaveEdit = useMemo(() => {
  return !!editForm.name.trim() && parsePriceToCents(editForm.priceReais) !== null && !!editingItem
}, [editForm.name, editForm.priceReais, editingItem])

// depois
const canSaveEdit = useMemo(() => {
  return !!editForm.name.trim() && editForm.price > 0 && !!editingItem
}, [editForm.name, editForm.price, editingItem])
```

**Step 8: Atualizar `handleCreate` — remover `parsePriceToCents`, usar `createForm.price` direto**

```ts
// antes
const price = parsePriceToCents(createForm.priceReais)
if (price === null) {
  toast.error('Preço inválido')
  return
}
// ...
price,

// depois
// (remover bloco de parsePriceToCents e if)
// ...
price: createForm.price,
```

**Step 9: Atualizar `handleEdit` — remover `parsePriceToCents`, usar `editForm.price` direto**

```ts
// antes
const price = parsePriceToCents(editForm.priceReais)
if (price === null) {
  toast.error('Preço inválido')
  return
}
// ...
price,

// depois
// (remover bloco de parsePriceToCents e if)
// ...
price: editForm.price,
```

**Step 10: Substituir `<Input>` de preço no dialog de criação**

```tsx
// antes
<Label htmlFor="create-item-price">Preço (R$)</Label>
<Input
  id="create-item-price"
  placeholder="0,00"
  value={createForm.priceReais}
  onChange={(event) =>
    setCreateForm((prev) => ({ ...prev, priceReais: event.target.value }))
  }
/>

// depois
<Label htmlFor="create-item-price">Preço</Label>
<CurrencyInput
  id="create-item-price"
  value={createForm.price}
  onChange={(cents) => setCreateForm((prev) => ({ ...prev, price: cents }))}
/>
```

**Step 11: Substituir `<Input>` de preço no dialog de edição**

```tsx
// antes
<Label htmlFor="edit-item-price">Preço (R$)</Label>
<Input
  id="edit-item-price"
  value={editForm.priceReais}
  onChange={(event) =>
    setEditForm((prev) => ({ ...prev, priceReais: event.target.value }))
  }
/>

// depois
<Label htmlFor="edit-item-price">Preço</Label>
<CurrencyInput
  id="edit-item-price"
  value={editForm.price}
  onChange={(cents) => setEditForm((prev) => ({ ...prev, price: cents }))}
/>
```

**Step 12: Verificar que não sobrou nenhuma referência a `priceReais` ou `parsePriceToCents`**

Buscar no arquivo: `priceReais` e `parsePriceToCents` — deve retornar zero resultados.

**Step 13: Commit**

```bash
git add inertia/containers/canteen-items-container.tsx
git commit -m "feat: use CurrencyInput in canteen items form, replace priceReais string with price cents"
```

---

### Task 3: Smoke test no browser

**Step 1: Abrir `/escola/cantina/itens` com impersonação do Testerson**

Confirmar que:

- Ao clicar em "Novo Item", o campo Preço mostra `R$ 0,00`
- Digitar `1` → `R$ 0,01`
- Digitar `5` → `R$ 0,15`
- Digitar `0` → `R$ 1,50`
- Backspace remove o último dígito
- Salvar um item com preço → item aparece na lista com valor correto

**Step 2: Abrir edição de um item existente**

Confirmar que o preço é pré-preenchido corretamente (ex: item com price=150 centavos → `R$ 1,50`).
