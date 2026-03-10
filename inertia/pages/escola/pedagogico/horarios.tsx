import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EscolaLayout } from '~/components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { ArrowLeft, Calendar, Settings } from 'lucide-react'
import { ScheduleGrid } from '~/containers/schedule/schedule-grid'
import { ScheduleConfigForm } from '~/containers/schedule/schedule-config-form'
import { api } from '~/lib/api'

interface ScheduleData {
  calendar: { id: string; name: string; isActive: boolean } | null
  slots: Array<{
    id: string
    classWeekDay: number
    startTime: string
    endTime: string
    isBreak: boolean
  }>
}

async function fetchSchedule(classId: string, academicPeriodId: string): Promise<ScheduleData> {
  const response = await fetch(
    `/api/v1/schedules/class/${classId}?academicPeriodId=${academicPeriodId}`
  )
  if (!response.ok) throw new Error('Failed to fetch schedule')
  return response.json()
}

export default function HorariosPage() {
  const queryClient = useQueryClient()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedAcademicPeriodId, setSelectedAcademicPeriodId] = useState<string>('')
  const [showConfigForm, setShowConfigForm] = useState(false)

  const { data: periodsData, isLoading: loadingPeriods } = useQuery(
    api.api.v1.academicPeriods.listAcademicPeriods.queryOptions({ query: { limit: 100 } })
  )

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    ...api.api.v1.classes.index.queryOptions({
      query: { limit: 100, academicPeriodId: selectedAcademicPeriodId },
    }),
    enabled: !!selectedAcademicPeriodId,
  })

  const { data: scheduleData, isLoading: loadingSchedule } = useQuery({
    queryKey: ['schedule', selectedClassId, selectedAcademicPeriodId],
    queryFn: () => fetchSchedule(selectedClassId, selectedAcademicPeriodId),
    enabled: !!selectedClassId && !!selectedAcademicPeriodId,
  })

  const classes = classesData?.data ?? []
  const academicPeriods = periodsData?.data ?? []
  const selectedClass = classes.find((c) => c.id === selectedClassId)

  const hasSchedule = scheduleData?.slots && scheduleData.slots.length > 0
  const shouldShowConfigForm = !loadingSchedule && (!hasSchedule || showConfigForm)

  const handleGenerate = () => {
    // Invalidate the schedule query to refetch with new data
    queryClient.invalidateQueries({
      queryKey: ['schedule', selectedClassId, selectedAcademicPeriodId],
    })
    setShowConfigForm(false)
  }

  return (
    <EscolaLayout>
      <Head title="Gerenciar Horários" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.pedagogico.grade">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gerenciar Horários</h1>
            <p className="text-muted-foreground">Configure os horários das aulas para cada turma</p>
          </div>
        </div>

        {/* Seletores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleção
            </CardTitle>
            <CardDescription>
              Selecione a turma e o período letivo para configurar os horários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Período Letivo</Label>
                <Select
                  value={selectedAcademicPeriodId}
                  onValueChange={(value, _event) => {
                    if (value === null) return
                    setSelectedAcademicPeriodId(value)
                    setSelectedClassId('')
                    setShowConfigForm(false)
                  }}
                  disabled={loadingPeriods}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingPeriods ? 'Carregando...' : 'Selecione um período'}
                    >
                      {academicPeriods.find((ap) => ap.id === selectedAcademicPeriodId)?.name ||
                        (loadingPeriods ? 'Carregando...' : 'Selecione um período')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicPeriods.map((ap) => (
                      <SelectItem key={ap.id} value={ap.id}>
                        {ap.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Turma</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(value, _event) => {
                    if (value === null) return
                    setSelectedClassId(value)
                    setShowConfigForm(false)
                  }}
                  disabled={!selectedAcademicPeriodId || loadingClasses}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedAcademicPeriodId
                          ? 'Selecione um período primeiro'
                          : loadingClasses
                            ? 'Carregando...'
                            : 'Selecione uma turma'
                      }
                    >
                      {selectedClass
                        ? `${selectedClass.name}${selectedClass.level?.name ? ` - ${selectedClass.level.name}` : ''}`
                        : !selectedAcademicPeriodId
                          ? 'Selecione um período primeiro'
                          : loadingClasses
                            ? 'Carregando...'
                            : 'Selecione uma turma'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.level?.name && ` - ${c.level.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aviso se não selecionou */}
        {(!selectedClassId || !selectedAcademicPeriodId) && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Selecione uma turma e um período letivo para visualizar e editar os horários.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Conteúdo principal */}
        {selectedClassId && selectedAcademicPeriodId && (
          <>
            {/* Botão para reconfigurar se já tem schedule */}
            {hasSchedule && !showConfigForm && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowConfigForm(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Reconfigurar Grade
                </Button>
              </div>
            )}

            {/* Config Form */}
            {shouldShowConfigForm && (
              <ScheduleConfigForm
                classId={selectedClassId}
                academicPeriodId={selectedAcademicPeriodId}
                onGenerate={handleGenerate}
              />
            )}

            {/* Grade de horários */}
            {hasSchedule && !showConfigForm && (
              <ScheduleGrid
                classId={selectedClassId}
                academicPeriodId={selectedAcademicPeriodId}
                className={selectedClass?.name}
              />
            )}
          </>
        )}
      </div>
    </EscolaLayout>
  )
}
