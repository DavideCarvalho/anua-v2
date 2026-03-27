import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { ScheduleConfigForm, type ScheduleConfig } from '~/containers/schedule/schedule-config-form'
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

const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  startTime: '07:30',
  classesPerDay: 6,
  classDuration: 50,
  breakAfterClass: 3,
  breakDuration: 20,
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

function inferConfigFromSlots(slots: ScheduleData['slots']): ScheduleConfig | null {
  if (!slots.length) return null

  const byDay = new Map<number, ScheduleData['slots']>()
  for (const slot of slots) {
    const current = byDay.get(slot.classWeekDay) ?? []
    current.push(slot)
    byDay.set(slot.classWeekDay, current)
  }

  const dayWithMostSlots = Array.from(byDay.values())
    .sort((a, b) => b.length - a.length)
    .at(0)

  if (!dayWithMostSlots?.length) return null

  const orderedSlots = [...dayWithMostSlots].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  )

  // Detect break by duration (short slot between longer ones)
  const slotDurations = orderedSlots.map(
    (slot) => toMinutes(slot.endTime) - toMinutes(slot.startTime)
  )
  const maxDuration = Math.max(...slotDurations)
  const minDuration = Math.min(...slotDurations)
  const isBreakByDuration = orderedSlots.map((slot) => {
    const duration = toMinutes(slot.endTime) - toMinutes(slot.startTime)
    // If there's a significant duration difference, short slots are breaks
    if (maxDuration - minDuration > 15) {
      return duration < maxDuration * 0.6
    }
    return slot.isBreak
  })

  const firstClass = orderedSlots.find((_slot, i) => !isBreakByDuration[i])
  const firstBreakIndex = orderedSlots.findIndex((_slot, i) => isBreakByDuration[i])
  const firstBreak = firstBreakIndex >= 0 ? orderedSlots[firstBreakIndex] : null

  const classesPerDay = orderedSlots.filter((_, i) => !isBreakByDuration[i]).length
  const classDuration = firstClass
    ? toMinutes(firstClass.endTime) - toMinutes(firstClass.startTime)
    : 50
  const inferredBreakAfterClass =
    firstBreakIndex >= 0
      ? orderedSlots.slice(0, firstBreakIndex).filter((_, i) => !isBreakByDuration[i]).length
      : DEFAULT_SCHEDULE_CONFIG.breakAfterClass
  const inferredBreakDuration = firstBreak
    ? toMinutes(firstBreak.endTime) - toMinutes(firstBreak.startTime)
    : DEFAULT_SCHEDULE_CONFIG.breakDuration

  return {
    startTime: firstClass?.startTime ?? DEFAULT_SCHEDULE_CONFIG.startTime,
    classesPerDay: classesPerDay || DEFAULT_SCHEDULE_CONFIG.classesPerDay,
    classDuration: classDuration || DEFAULT_SCHEDULE_CONFIG.classDuration,
    breakAfterClass: inferredBreakAfterClass || DEFAULT_SCHEDULE_CONFIG.breakAfterClass,
    breakDuration: inferredBreakDuration,
  }
}

async function fetchSchedule(classId: string, academicPeriodId: string): Promise<ScheduleData> {
  const response = await fetch(
    `/api/v1/schedules/class/${classId}?academicPeriodId=${academicPeriodId}`
  )
  if (!response.ok) throw new Error('Failed to fetch schedule')
  return response.json()
}

export default function HorariosPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedAcademicPeriodId, setSelectedAcademicPeriodId] = useState<string>('')
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG)
  const [originalConfig, setOriginalConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG)
  const [hasEditedConfigInSession, setHasEditedConfigInSession] = useState(false)
  const [hydratedSelectionKey, setHydratedSelectionKey] = useState<string | null>(null)
  const [reorganizeTrigger, setReorganizeTrigger] = useState(0)

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
  const selectionKey = useMemo(() => {
    if (!selectedClassId || !selectedAcademicPeriodId) return null
    return `${selectedClassId}:${selectedAcademicPeriodId}`
  }, [selectedClassId, selectedAcademicPeriodId])

  const hasSchedule = scheduleData?.slots && scheduleData.slots.length > 0
  const shouldShowConfigForm = !loadingSchedule && (!hasSchedule || showConfigForm)

  useEffect(() => {
    if (!selectionKey || hydratedSelectionKey === selectionKey || hasEditedConfigInSession) return
    if (loadingSchedule || !scheduleData) {
      return
    }

    const inferredConfig = inferConfigFromSlots(scheduleData.slots ?? [])
    console.log('[DEBUG horarios] Inferred config:', inferredConfig)
    if (inferredConfig) {
      setScheduleConfig(inferredConfig)
    }
    setHydratedSelectionKey(selectionKey)
  }, [
    hasEditedConfigInSession,
    hydratedSelectionKey,
    loadingSchedule,
    scheduleData,
    selectionKey,
    setScheduleConfig,
  ])

  const handleScheduleConfigChange = (next: ScheduleConfig) => {
    setScheduleConfig(next)
    setHasEditedConfigInSession(true)
  }

  const handleApplyConfig = () => {
    setShowConfigForm(false)
    setReorganizeTrigger((prev) => prev + 1)
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
                    setHydratedSelectionKey(null)
                    setHasEditedConfigInSession(false)
                    setScheduleConfig({ ...DEFAULT_SCHEDULE_CONFIG })
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
                    setHydratedSelectionKey(null)
                    setHasEditedConfigInSession(false)
                    setScheduleConfig({ ...DEFAULT_SCHEDULE_CONFIG })
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
                <Button
                  variant="outline"
                  onClick={() => {
                    const inferredConfig = inferConfigFromSlots(scheduleData?.slots ?? [])
                    if (inferredConfig) {
                      setScheduleConfig(inferredConfig)
                      setOriginalConfig(inferredConfig)
                    } else {
                      setOriginalConfig(scheduleConfig)
                    }
                    setHasEditedConfigInSession(false)
                    setShowConfigForm(true)
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Reconfigurar Grade
                </Button>
              </div>
            )}

            {/* Config Form */}
            {shouldShowConfigForm && (
              <ScheduleConfigForm
                value={scheduleConfig}
                onChange={handleScheduleConfigChange}
                onApply={handleApplyConfig}
                onCancel={() => {
                  setScheduleConfig(originalConfig)
                  setShowConfigForm(false)
                }}
              />
            )}

            {/* Grade de horários */}
            {hasSchedule && !showConfigForm && (
              <ScheduleGrid
                classId={selectedClassId}
                academicPeriodId={selectedAcademicPeriodId}
                scheduleConfig={scheduleConfig}
                className={selectedClass?.name}
                reorganizeTrigger={reorganizeTrigger}
              />
            )}
          </>
        )}
      </div>
    </EscolaLayout>
  )
}
