# Design: Cardápio — Navegação de Semanas + Importar Refeição Passada

**Data:** 2026-03-13  
**Status:** Aprovado

## Contexto

A tela `/escola/cantina/cardapio` exibe uma grade semanal (seg–sex) com refeições cadastradas. Atualmente a semana é sempre a corrente (`startOfWeek(new Date())`), sem possibilidade de navegar para outras semanas nem reutilizar refeições de dias anteriores.

## Objetivos

1. **Navegação entre semanas** — avançar/voltar semanas no calendário via setas, com botão "Hoje" para resetar.
2. **Importar refeição passada** — no modal de criar/editar, combobox que busca refeições anteriores por nome e preenche os campos automaticamente.

## O que não muda

- Nenhuma migration necessária
- Nenhum endpoint novo (o `GET /api/v1/canteen-meals` já suporta busca por `canteenId` + `limit`)
- Fluxo de criação/edição permanece igual — apenas UI adicional

---

## Melhoria 1: Navegação entre semanas

### Estado

Adicionar `weekOffset` (inteiro, default `0`) ao componente `CardapioPage`:

```ts
const [weekOffset, setWeekOffset] = useState(0)
```

O `weekStart` passa a ser calculado com o offset:

```ts
const weekStart = useMemo(
  () => addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset),
  [weekOffset]
)
```

Os `weekDays` já dependem de `weekStart`, então se atualizam automaticamente.

### UI do header

Substituir o `CardTitle` estático "Semana Atual" por controles de navegação:

```
[<]  semana de 10–14 mar 2026  [Hoje]  [>]
```

- `ChevronLeft` → `setWeekOffset(w => w - 1)`
- `ChevronRight` → `setWeekOffset(w => w + 1)`
- Botão "Hoje" → `setWeekOffset(0)` (oculto quando `weekOffset === 0`)

### Query

A query de listagem já busca `limit: 100` sem filtro de data — funciona para qualquer semana desde que as refeições estejam dentro do resultado. Para garantir, adicionar filtro de intervalo na query quando possível.

O endpoint `listCanteenMealsValidator` só aceita `servedAt` (data exata), não intervalo. A abordagem mais simples — e sem mudança de backend — é manter `limit: 100` e filtrar client-side via `mealsByDate` (já funciona assim).

> **Alternativa futura:** adicionar `servedAtStart` / `servedAtEnd` ao validator para queries mais eficientes.

---

## Melhoria 2: Importar refeição passada no modal

### Onde aparece

Ambos os modais: "Nova Refeição" e "Editar Refeição". O combobox fica no topo do `MealForm`, acima do campo "Nome".

### Comportamento

1. Usuário digita no combobox (mínimo 2 chars para disparar busca)
2. Lista mostra refeições passadas da mesma cantina (usando `useDebounce` + `useQuery`)
3. Ao selecionar uma refeição, preenche `name`, `description`, `priceReais`
4. Usuário edita os campos se quiser e salva normalmente
5. O combobox é independente — selecionar não impede edição manual

### Query do combobox

```ts
useQuery({
  ...api.api.v1.canteenMeals.index.queryOptions({
    query: { canteenId, limit: 10, isActive: true },
  }),
  enabled: !!canteenId && searchTerm.length >= 2,
})
```

Filtro por nome feito client-side (sem `search` param no validator atual) sobre os 10 resultados.

> **Alternativa futura:** adicionar `search` (nome) ao `listCanteenMealsValidator` para busca server-side.

### Componente `MealForm`

Recebe duas props adicionais:

- `canteenId: string | null | undefined`
- `onImport: (meal: CanteenMeal) => void` — callback que o pai passa para preencher o form

O combobox é implementado com `Popover` + `Command` (padrão já usado em `canteen-gate.tsx`).

### UX

- Label: "Importar de refeição anterior (opcional)"
- Placeholder: "Buscar por nome..."
- Se o campo de busca estiver vazio, não mostra lista
- Após importar, o combobox reseta (campo fica vazio, pronto para nova busca)

---

## Arquivos modificados

| Arquivo                                     | Mudança                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `inertia/pages/escola/cantina/cardapio.tsx` | Adicionar `weekOffset` state, recalcular `weekStart`, UI de navegação no header, atualizar `MealForm` para suportar combobox de importação |

Apenas **um arquivo frontend** é modificado. Nenhum arquivo backend é alterado.
