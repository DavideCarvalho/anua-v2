import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Repeat, Settings, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { api } from '~/lib/api'

const WEEKDAYS = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
] as const

const MEAL_TYPES = [
  { value: 'LUNCH', label: 'Almoço' },
  { value: 'DINNER', label: 'Janta' },
] as const

type RecurrenceSlot = {
  id?: string
  weekDay: number
  mealType: 'LUNCH' | 'DINNER'
  canteenMealId: string | null
  canteenMeal?: { id: string; name: string; mealType: string } | null
}

interface MealRecurrenceConfigProps {
  studentId: string
}

export function MealRecurrenceConfig({ studentId }: MealRecurrenceConfigProps) {
  const queryClient = useQueryClient()
  const [openSlot, setOpenSlot] = useState<{
    weekDay: number
    mealType: 'LUNCH' | 'DINNER'
  } | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    ...api.api.v1.responsavel.api.studentMealRecurrence.queryOptions({
      params: { studentId },
    }),
    enabled: !!studentId,
  })

  const updateMutation = useMutation(
    api.api.v1.responsavel.api.updateStudentMealRecurrence.mutationOptions()
  )

  const canteenId = data?.canteenId ?? null
  const recurrences: RecurrenceSlot[] = (data?.data ?? []).map((r) => ({
    id: r.id,
    weekDay: r.weekDay,
    mealType: r.mealType as 'LUNCH' | 'DINNER',
    canteenMealId: r.canteenMealId,
    canteenMeal: r.canteenMeal,
  }))

  const getSlotConfig = (weekDay: number, mealType: 'LUNCH' | 'DINNER') =>
    recurrences.find((r) => r.weekDay === weekDay && r.mealType === mealType)

  const handleSaveSlot = (
    weekDay: number,
    mealType: 'LUNCH' | 'DINNER',
    value: 'livre' | 'desativar'
  ) => {
    const newSlots: RecurrenceSlot[] =
      value === 'desativar'
        ? recurrences.filter((r) => !(r.weekDay === weekDay && r.mealType === mealType))
        : [
            ...recurrences.filter((r) => !(r.weekDay === weekDay && r.mealType === mealType)),
            { weekDay, mealType, canteenMealId: null, canteenMeal: null },
          ]
    const payload = {
      slots: newSlots.map((s) => ({
        weekDay: s.weekDay,
        mealType: s.mealType,
        canteenMealId: s.canteenMealId,
      })),
    }
    updateMutation.mutate(
      { params: { studentId }, body: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: api.api.v1.responsavel.api.studentMealRecurrence.queryOptions({
              params: { studentId },
            }).queryKey,
          })
          setOpenSlot(null)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar recorrência:{' '}
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!canteenId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Repeat className="mx-auto h-10 w-10 opacity-50" />
          <p className="mt-2 text-sm">
            A escola do aluno não possui cantina configurada. A recorrência de refeições não está
            disponível.
          </p>
        </CardContent>
      </Card>
    )
  }

  const summaryParts: string[] = []
  for (const wd of WEEKDAYS) {
    const lunch = getSlotConfig(wd.value, 'LUNCH')
    const dinner = getSlotConfig(wd.value, 'DINNER')
    if (lunch || dinner) {
      const parts: string[] = []
      if (lunch) parts.push('Almoço: Livre')
      if (dinner) parts.push('Janta: Livre')
      summaryParts.push(`${wd.label}: ${parts.join(' / ')}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Recorrência de Refeições
        </CardTitle>
        <CardDescription>
          Configure reservas automáticas por dia da semana. A reserva será criada com o que houver
          no cardápio do dia (o cardápio muda toda semana).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {WEEKDAYS.map((wd) => (
            <div key={wd.value} className="flex flex-col gap-2">
              <span className="text-center text-xs font-medium text-muted-foreground">
                {wd.label}
              </span>
              {MEAL_TYPES.map((mt) => {
                const config = getSlotConfig(wd.value, mt.value)
                const label = config ? 'Livre' : 'Não configurado'
                return (
                  <Dialog
                    key={`${wd.value}-${mt.value}`}
                    open={openSlot?.weekDay === wd.value && openSlot?.mealType === mt.value}
                    onOpenChange={(open) =>
                      setOpenSlot(open ? { weekDay: wd.value, mealType: mt.value } : null)
                    }
                  >
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          className="relative h-16 w-full flex-col gap-1 py-2 pl-3 pr-8 min-w-0"
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            {mt.label}
                          </span>
                          <span className="text-sm truncate w-full text-center">{label}</span>
                          <Settings className="absolute right-2 top-1/2 size-3.5 -translate-y-1/2 shrink-0 text-muted-foreground" />
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Configurar {wd.label} - {mt.label}
                        </DialogTitle>
                        <DialogDescription>
                          A reserva será criada automaticamente com o que houver no cardápio do dia.
                          O cardápio muda toda semana, então não é possível pré-selecionar uma
                          refeição específica.
                        </DialogDescription>
                      </DialogHeader>
                      <SlotConfigForm
                        weekDay={wd.value}
                        mealType={mt.value}
                        currentValue={config ? 'livre' : 'desativar'}
                        onSave={(value) => handleSaveSlot(wd.value, mt.value, value)}
                        onCancel={() => setOpenSlot(null)}
                        isSaving={updateMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          ))}
        </div>

        {summaryParts.length > 0 && (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            <p className="font-medium text-muted-foreground mb-1">Resumo</p>
            <p>{summaryParts.join(' | ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SlotConfigForm({
  currentValue,
  onSave,
  onCancel,
  isSaving,
}: {
  weekDay: number
  mealType: 'LUNCH' | 'DINNER'
  currentValue: 'livre' | 'desativar'
  onSave: (value: 'livre' | 'desativar') => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [selected, setSelected] = useState<'livre' | 'desativar'>(currentValue)

  useEffect(() => {
    setSelected(currentValue)
  }, [currentValue])

  return (
    <>
      <div className="space-y-3 py-4">
        <Label>Recorrência</Label>
        <RadioGroup
          value={selected}
          onValueChange={(v) => setSelected(v as 'livre' | 'desativar')}
          className="grid gap-3"
        >
          <div className="flex items-start gap-3 rounded-lg border border-input p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-accent/50">
            <RadioGroupItem value="livre" id="livre" className="mt-0.5" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="livre" className="cursor-pointer font-medium">
                Reserva automática (Livre)
              </Label>
              <p className="text-sm text-muted-foreground">
                Uma reserva será criada automaticamente com o que houver no cardápio do dia.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-input p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-accent/50">
            <RadioGroupItem value="desativar" id="desativar" className="mt-0.5" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="desativar" className="cursor-pointer font-medium">
                Desativar
              </Label>
              <p className="text-sm text-muted-foreground">
                Não criar reserva automática para este horário.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(selected)} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </>
  )
}
