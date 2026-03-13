import { Head, usePage } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDays, addWeeks, format, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
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
import { formatCurrency } from '../../../lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

type CanteenMeal = {
  id: string
  name: string
  description?: string | null
  date: string | Date
  price: number
  maxServings?: number | null
}

interface PaginatorLike<T> {
  data: T[]
}

interface MealFormValues {
  name: string
  description: string
  date: string
  priceReais: string
  maxReservations: string
}

const emptyMealForm: MealFormValues = {
  name: '',
  description: '',
  date: '',
  priceReais: '',
  maxReservations: '',
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

  const mealsByDate = useMemo(() => {
    const map = new Map<string, CanteenMeal[]>()

    for (const meal of meals) {
      const key = toDateKey(meal.date)
      const existing = map.get(key) ?? []
      existing.push(meal)
      map.set(key, existing)
    }

    return map
  }, [meals])

  const openCreateForDate = (date: Date) => {
    setCreateForm({ ...emptyMealForm, date: toDateInput(date) })
    setCreateOpen(true)
  }

  const openEdit = (meal: CanteenMeal) => {
    setEditingMeal(meal)
    setEditForm({
      name: meal.name,
      description: meal.description ?? '',
      date: toDateInput(new Date(String(meal.date))),
      priceReais: (meal.price / 100).toFixed(2),
      maxReservations: meal.maxServings ? String(meal.maxServings) : '',
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
            <p className="text-muted-foreground">Configure o cardápio semanal da cantina</p>
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
                    const dayMeals = mealsByDate.get(key) ?? []

                    return (
                      <Card key={key}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            {format(day, 'EEEE', { locale: ptBR })}
                          </CardTitle>
                          <CardDescription>{format(day, 'dd/MM')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {dayMeals.length === 0 ? (
                            <div className="text-center py-3 text-muted-foreground">
                              <UtensilsCrossed className="h-5 w-5 mx-auto mb-1 opacity-50" />
                              <p className="text-xs">Não definido</p>
                            </div>
                          ) : (
                            dayMeals.map((meal) => (
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
                                    <span className="sr-only">Editar refeição {meal.name}</span>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(meal)}
                                  >
                                    <span className="sr-only">Excluir refeição {meal.name}</span>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => openCreateForDate(day)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
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
          <MealForm form={createForm} setForm={setCreateForm} />
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
          <MealForm form={editForm} setForm={setEditForm} />
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
}: {
  form: MealFormValues
  setForm: React.Dispatch<React.SetStateAction<MealFormValues>>
}) {
  return (
    <div className="space-y-4">
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
