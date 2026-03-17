import { Head, usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { Repeat, User } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { CanteenGate } from '../../../components/cantina/canteen-gate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { api } from '~/lib/api'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
  canteens?: Array<{ id: string; name: string; schoolId: string }>
}

type RecurrenceEntry = {
  studentId: string
  studentName: string
  slots: Array<{
    weekDay: number
    weekDayLabel: string
    mealType: string
    mealTypeLabel: string
    canteenMealName: string | null
  }>
}

export default function CantinaRecorrenciasPage() {
  const { props } = usePage<PageProps>()
  const selectedSchoolIds = props.selectedSchoolIds ?? []

  const { data, isLoading, isError, error } = useQuery({
    ...api.api.v1.canteens.mealRecurrencesBySchools.queryOptions(),
    enabled: selectedSchoolIds.length > 0,
  })

  const entries: RecurrenceEntry[] = data?.data ?? []

  return (
    <EscolaLayout>
      <Head title="Recorrências de Refeições" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Repeat className="h-6 w-6" />
            Recorrências de Refeições
          </h1>
          <p className="text-muted-foreground">
            Alunos com almoço/janta configurados por dia da semana (responsável)
          </p>
        </div>

        <CanteenGate>
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Carregando recorrências...
              </CardContent>
            </Card>
          ) : isError ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">
                  {error instanceof Error ? error.message : 'Erro ao carregar'}
                </p>
              </CardContent>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Repeat className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma recorrência configurada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Os responsáveis podem configurar recorrência em /responsavel/cantina
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Alunos com recorrência</CardTitle>
                <CardDescription>{entries.length} aluno(s) com configuração</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.studentId}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {entry.studentName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entry.slots.map((slot, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {slot.weekDayLabel} {slot.mealTypeLabel}:{' '}
                            {slot.canteenMealName ?? 'Livre'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CanteenGate>
      </div>
    </EscolaLayout>
  )
}
