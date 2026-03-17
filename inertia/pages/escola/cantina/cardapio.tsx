import { Head, usePage } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { addDays, addWeeks, format, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from '@inertiajs/react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { EscolaLayout } from '../../../components/layouts'
import { CanteenGate } from '../../../components/cantina/canteen-gate'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command'
import { formatCurrency } from '../../../lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { SharedProps } from '../../../lib/types'
import { useDebounce } from '../../../hooks/use_debounce'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

type CanteenMeal = {
  id: string
  name: string
  description?: string | null
  date: string | Date
  price: number
  maxServings?: number | null
  mealType?: MealType
}

interface PaginatorLike<T> {
  data: T[]
}

const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'LUNCH', label: 'Almoço' },
  { value: 'DINNER', label: 'Janta' },
]

interface MealFormValues {
  name: string
  description: string
  date: string
  priceReais: string
  maxReservations: string
  mealType: MealType
}

const emptyMealForm: MealFormValues = {
  name: '',
  description: '',
  date: '',
  priceReais: '',
  maxReservations: '',
  mealType: 'LUNCH',
}

function priceToCents(value: string) {
  const normalized = Number(value.replace(',', '.'))
  if (!Number.isFinite(normalized) || normalized < 0) {
    return null
  }
  return Math.round(normalized * 100)
}

function toDateInput(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function toDateKey(value: string | Date) {
  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/)
    if (match) {
      return match[0]
    }
  }

  return toDateInput(new Date(value))
}

export default function CardapioPage() {
  const { props } = usePage<PageProps>()
  const canteenId = props.canteenId
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(
    () => addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset),
    [weekOffset]
  )

  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const [createOpen, setCreateOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<CanteenMeal | null>(null)
  const [createForm, setCreateForm] = useState<MealFormValues>(emptyMealForm)
  const [editForm, setEditForm] = useState<MealFormValues>(emptyMealForm)

  const queryClient = useQueryClient()
  const createMeal = useMutation(api.api.v1.canteenMeals.store.mutationOptions())
  const updateMeal = useMutation(api.api.v1.canteenMeals.update.mutationOptions())
  const deleteMeal = useMutation(api.api.v1.canteenMeals.destroy.mutationOptions())

  const { data, isLoading } = useQuery({
    ...api.api.v1.canteenMeals.index.queryOptions({
      query: {
        canteenId: canteenId ?? undefined,
        page: 1,
        limit: 100,
        isActive: true,
      },
    }),
    enabled: !!canteenId,
  })

  const meals = (data as PaginatorLike<CanteenMeal> | undefined)?.data ?? []

  const countsQueries = useQueries({
    queries: weekDays.map((day) => ({
      ...api.api.v1.canteenMealReservations.counts.queryOptions({
        query: { canteenId: canteenId ?? '', date: toDateInput(day) },
      }),
      enabled: !!canteenId,
    })),
  })
  const countsByDate = useMemo(() => {
    const map = new Map<string, { lunch: number; dinner: number }>()
    weekDays.forEach((day, i) => {
      const res = countsQueries[i]?.data as { lunch: number; dinner: number } | undefined
      map.set(toDateInput(day), res ?? { lunch: 0, dinner: 0 })
    })
    return map
  }, [weekDays, countsQueries])

  const mealsByDateAndType = useMemo(() => {
    const map = new Map<string, Map<MealType, CanteenMeal[]>>()

    for (const meal of meals) {
      const dateKey = toDateKey(meal.date)
      const type = (meal.mealType as MealType) ?? 'LUNCH'
      if (!map.has(dateKey)) {
        map.set(dateKey, new Map())
      }
      const typeMap = map.get(dateKey)!
      const existing = typeMap.get(type) ?? []
      existing.push(meal)
      typeMap.set(type, existing)
    }

    return map
  }, [meals])

  const openCreateForDate = (date: Date, mealType: MealType = 'LUNCH') => {
    setCreateForm({ ...emptyMealForm, date: toDateInput(date), mealType })
    setCreateOpen(true)
  }

  const openEdit = (meal: CanteenMeal) => {
    setEditingMeal(meal)
    setEditForm({
      name: meal.name,
      description: meal.description ?? '',
      date: toDateKey(meal.date),
      priceReais: (meal.price / 100).toFixed(2),
      maxReservations: meal.maxServings ? String(meal.maxServings) : '',
      mealType: (meal.mealType as MealType) ?? 'LUNCH',
    })
  }

  const handleCreate = async () => {
    if (!canteenId) {
      toast.error('Cantina não encontrada no contexto atual')
      return
    }

    const price = priceToCents(createForm.priceReais)
    if (!createForm.name.trim() || !createForm.date || price === null) {
      toast.error('Preencha nome, data e preço válidos')
      return
    }

    const maxReservations = createForm.maxReservations
      ? Number.parseInt(createForm.maxReservations, 10)
      : undefined

    await toast.promise(
      createMeal.mutateAsync({
        body: {
          canteenId,
          name: createForm.name.trim(),
          description: createForm.description.trim() || undefined,
          price,
          servedAt: createForm.date,
          mealType: createForm.mealType,
          maxReservations,
        },
      }),
      {
        loading: 'Criando refeição...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: api.api.v1.canteenMeals.index.pathKey() })
          setCreateOpen(false)
          setCreateForm(emptyMealForm)
          return 'Refeição criada com sucesso'
        },
        error: (err) => (err instanceof Error ? err.message : 'Erro ao criar refeição'),
      }
    )
  }

  const handleEdit = async () => {
    if (!editingMeal) {
      return
    }

    const price = priceToCents(editForm.priceReais)
    if (!editForm.name.trim() || !editForm.date || price === null) {
      toast.error('Preencha nome, data e preço válidos')
      return
    }

    const maxReservations = editForm.maxReservations
      ? Number.parseInt(editForm.maxReservations, 10)
      : undefined

    await toast.promise(
      updateMeal.mutateAsync({
        params: { id: editingMeal.id },
        body: {
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          price,
          servedAt: editForm.date,
          mealType: editForm.mealType,
          maxReservations,
        },
      }),
      {
        loading: 'Atualizando refeição...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: api.api.v1.canteenMeals.index.pathKey() })
          setEditingMeal(null)
          return 'Refeição atualizada'
        },
        error: (err) => (err instanceof Error ? err.message : 'Erro ao atualizar refeição'),
      }
    )
  }

  const handleDelete = async (meal: CanteenMeal) => {
    if (!confirm(`Excluir a refeição "${meal.name}"?`)) {
      return
    }

    await toast.promise(deleteMeal.mutateAsync({ params: { id: meal.id } }), {
      loading: 'Excluindo refeição...',
      success: () => {
        queryClient.invalidateQueries({ queryKey: api.api.v1.canteenMeals.index.pathKey() })
        return 'Refeição excluída'
      },
      error: (err) => (err instanceof Error ? err.message : 'Erro ao excluir refeição'),
    })
  }

  return (
    <EscolaLayout>
      <Head title="Cardápio" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cardápio</h1>
            <p className="text-muted-foreground">
              Configure almoço e janta da cantina por dia da semana
            </p>
          </div>
          <Button onClick={() => openCreateForDate(new Date())}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Refeição
          </Button>
        </div>

        <CanteenGate>
          <Card>
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
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Carregando cardápio...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-5">
                  {weekDays.map((day) => {
                    const key = toDateInput(day)
                    const dayByType = mealsByDateAndType.get(key)
                    const lunchMeals = dayByType?.get('LUNCH') ?? []
                    const dinnerMeals = dayByType?.get('DINNER') ?? []
                    const hasAny = lunchMeals.length > 0 || dinnerMeals.length > 0

                    const counts = countsByDate.get(key) ?? { lunch: 0, dinner: 0 }
                    const reservasHref = `/escola/cantina/reservas?date=${key}${canteenId ? `&canteenId=${canteenId}` : ''}`

                    const renderMealSlot = (type: MealType, typeMeals: CanteenMeal[]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">
                            {MEAL_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type}
                          </p>
                          {(type === 'LUNCH' ? counts.lunch : counts.dinner) > 0 && (
                            <Link
                              href={reservasHref}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Users className="h-3 w-3" />
                              {type === 'LUNCH' ? counts.lunch : counts.dinner}
                            </Link>
                          )}
                        </div>
                        {typeMeals.length === 0 ? (
                          <div className="rounded border border-dashed p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => openCreateForDate(day, type)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        ) : (
                          <>
                            {typeMeals.map((meal) => (
                              <div key={meal.id} className="rounded border p-2">
                                <p className="text-sm font-medium line-clamp-1">{meal.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(meal.price)}
                                </p>
                                <div className="mt-2 flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEdit(meal)}
                                  >
                                    <span className="sr-only">Editar {meal.name}</span>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(meal)}
                                  >
                                    <span className="sr-only">Excluir {meal.name}</span>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => openCreateForDate(day, type)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </>
                        )}
                      </div>
                    )

                    return (
                      <Card key={key}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            {format(day, 'EEEE', { locale: ptBR })}
                          </CardTitle>
                          <CardDescription>{format(day, 'dd/MM')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {!hasAny ? (
                            <div className="space-y-3">
                              <div className="text-center py-2 text-muted-foreground">
                                <UtensilsCrossed className="h-5 w-5 mx-auto mb-1 opacity-50" />
                                <p className="text-xs">Nenhuma refeição definida</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => openCreateForDate(day, 'LUNCH')}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Almoço
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => openCreateForDate(day, 'DINNER')}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Janta
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {renderMealSlot('LUNCH', lunchMeals)}
                              {renderMealSlot('DINNER', dinnerMeals)}
                              {(counts.lunch > 0 || counts.dinner > 0) && (
                                <Link
                                  href={reservasHref}
                                  className="mt-2 block text-center text-xs text-primary hover:underline"
                                >
                                  Ver reservas ({counts.lunch} almoço, {counts.dinner} janta)
                                </Link>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </CanteenGate>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Refeição</DialogTitle>
            <DialogDescription>Cadastre uma refeição para o cardápio.</DialogDescription>
          </DialogHeader>
          <MealForm form={createForm} setForm={setCreateForm} canteenId={canteenId} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMeal.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMeal} onOpenChange={(open) => !open && setEditingMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Refeição</DialogTitle>
            <DialogDescription>Atualize os dados da refeição.</DialogDescription>
          </DialogHeader>
          <MealForm form={editForm} setForm={setEditForm} canteenId={canteenId} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMeal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateMeal.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EscolaLayout>
  )
}

function MealForm({
  form,
  setForm,
  canteenId,
}: {
  form: MealFormValues
  setForm: React.Dispatch<React.SetStateAction<MealFormValues>>
  canteenId?: string | null
}) {
  const [importOpen, setImportOpen] = useState(false)
  const [importSearch, setImportSearch] = useState('')
  const [importSelected, setImportSelected] = useState<string | null>(null)
  const debouncedSearch = useDebounce(importSearch, 300)

  const { data: importData } = useQuery({
    ...api.api.v1.canteenMeals.index.queryOptions({
      query: {
        canteenId: canteenId ?? undefined,
        limit: 100,
        isActive: true,
        uniqueForImport: true,
      },
    }),
    enabled: !!canteenId && importOpen,
  })

  const importMeals = ((importData as PaginatorLike<CanteenMeal> | undefined)?.data ?? []).filter(
    (m) =>
      debouncedSearch.length < 2 || m.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const handleImport = (meal: CanteenMeal) => {
    setForm((prev) => ({
      ...prev,
      name: meal.name,
      description: meal.description ?? '',
      priceReais: (meal.price / 100).toFixed(2),
    }))
    setImportSelected(meal.name)
    setImportOpen(false)
    setImportSearch('')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="meal-type">Tipo de refeição</Label>
        <select
          id="meal-type"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.mealType}
          onChange={(e) => setForm((prev) => ({ ...prev, mealType: e.target.value as MealType }))}
        >
          {MEAL_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {canteenId && (
        <div className="space-y-1">
          <Label>Importar de refeição anterior (opcional)</Label>
          <Popover open={importOpen} onOpenChange={setImportOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                {importSelected ? (
                  <span>{importSelected}</span>
                ) : (
                  <span className="text-muted-foreground">Buscar por nome...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] p-0"
              align="start"
            >
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
                        <CommandItem
                          key={meal.id}
                          value={meal.id}
                          onSelect={() => handleImport(meal)}
                        >
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
      )}

      <div className="space-y-1">
        <Label htmlFor="meal-name">Nome</Label>
        <Input
          id="meal-name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meal-description">Descrição</Label>
        <Textarea
          id="meal-description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="meal-date">Data</Label>
          <Input
            id="meal-date"
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meal-price">Preço (R$)</Label>
          <Input
            id="meal-price"
            placeholder="0,00"
            value={form.priceReais}
            onChange={(event) => setForm((prev) => ({ ...prev, priceReais: event.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="meal-max">Limite de reservas (opcional)</Label>
        <Input
          id="meal-max"
          type="number"
          min={1}
          value={form.maxReservations}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, maxReservations: event.target.value }))
          }
        />
      </div>
    </div>
  )
}
