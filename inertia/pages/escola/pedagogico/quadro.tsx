import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { ArrowLeft, Calendar, Printer } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useClassesQueryOptions } from '~/hooks/queries/use_classes'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'

interface CalendarSlot {
  id: string
  classWeekDay: number
  startTime: string
  endTime: string
  isBreak: boolean
  teacherHasClass?: {
    teacher: { user: { name: string } }
    subject: { name: string }
  } | null
}

interface ScheduleData {
  calendar: { id: string; name: string } | null
  slots: CalendarSlot[]
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Segunda-feira', number: 1 },
  { key: 'TUESDAY', label: 'Terça-feira', number: 2 },
  { key: 'WEDNESDAY', label: 'Quarta-feira', number: 3 },
  { key: 'THURSDAY', label: 'Quinta-feira', number: 4 },
  { key: 'FRIDAY', label: 'Sexta-feira', number: 5 },
]

async function fetchSchedule(classId: string, academicPeriodId: string): Promise<ScheduleData> {
  const response = await fetch(
    `/api/v1/schedules/class/${classId}?academicPeriodId=${academicPeriodId}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch schedule')
  }
  return response.json()
}

export default function QuadroPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedAcademicPeriodId, setSelectedAcademicPeriodId] = useState<string>('')

  const { data: periodsData, isLoading: loadingPeriods } = useQuery(
    useAcademicPeriodsQueryOptions({ limit: 100 })
  )

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    ...useClassesQueryOptions({ limit: 100, academicPeriodId: selectedAcademicPeriodId }),
    enabled: !!selectedAcademicPeriodId,
  })

  const classes = classesData?.data ?? []
  const academicPeriods = periodsData?.data ?? []
  const selectedClass = classes.find((c) => c.id === selectedClassId)

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule', selectedClassId, selectedAcademicPeriodId],
    queryFn: () => fetchSchedule(selectedClassId, selectedAcademicPeriodId),
    enabled: !!selectedClassId && !!selectedAcademicPeriodId,
  })

  // Get unique time slots
  const timeSlots = scheduleData?.slots
    ? Array.from(new Set(scheduleData.slots.map((s) => `${s.startTime}-${s.endTime}`))).sort()
    : []

  const handlePrint = () => {
    window.print()
  }

  return (
    <EscolaLayout>
      <Head title="Quadro de Horários" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.pedagogico.grade">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Quadro de Horários</h1>
            <p className="text-muted-foreground">
              Visualize a grade completa de horários da escola
            </p>
          </div>
          {selectedClassId && selectedAcademicPeriodId && (
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          )}
        </div>

        {/* Seletores */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Período Letivo</Label>
                <Select
                  value={selectedAcademicPeriodId}
                  onValueChange={(value) => {
                    setSelectedAcademicPeriodId(value)
                    setSelectedClassId('')
                  }}
                  disabled={loadingPeriods}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingPeriods ? 'Carregando...' : 'Selecione um período'}
                    />
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
                  onValueChange={setSelectedClassId}
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
                    />
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
          <Card className="border-yellow-200 bg-yellow-50 print:hidden">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                Selecione uma turma e um período letivo para visualizar o quadro de horários.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quadro de horários */}
        {selectedClassId && selectedAcademicPeriodId && (
          <Card>
            <CardHeader className="print:pb-2">
              <CardTitle className="text-center text-xl">
                Quadro de Horários - {selectedClass?.name}
              </CardTitle>
              <CardDescription className="text-center">
                {academicPeriods.find((ap) => ap.id === selectedAcademicPeriodId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Nenhum horário configurado para esta turma.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32 border bg-muted font-bold">Horário</TableHead>
                        {DAYS_OF_WEEK.map((day) => (
                          <TableHead
                            key={day.key}
                            className="border bg-muted text-center font-bold"
                          >
                            {day.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((timeSlot) => {
                        const [startTime, endTime] = timeSlot.split('-')
                        return (
                          <TableRow key={timeSlot}>
                            <TableCell className="border bg-muted/50 font-medium">
                              {startTime} - {endTime}
                            </TableCell>
                            {DAYS_OF_WEEK.map((day) => {
                              const slot = scheduleData?.slots.find(
                                (s) =>
                                  s.classWeekDay === day.number &&
                                  s.startTime === startTime &&
                                  s.endTime === endTime
                              )

                              if (slot?.isBreak) {
                                return (
                                  <TableCell
                                    key={day.key}
                                    className="border bg-muted text-center font-medium text-muted-foreground"
                                  >
                                    INTERVALO
                                  </TableCell>
                                )
                              }

                              return (
                                <TableCell key={day.key} className="border text-center">
                                  {slot?.teacherHasClass ? (
                                    <div>
                                      <p className="font-medium text-primary">
                                        {slot.teacherHasClass.subject.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {slot.teacherHasClass.teacher.user.name}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
