import { useQuery } from '@tanstack/react-query'
import { Clock, BookOpen, User, AlertCircle, Star } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'

import {
  useStudentScheduleQueryOptions,
  type StudentScheduleResponse,
} from '../../hooks/queries/use_student_schedule'

type ScheduleDay = NonNullable<StudentScheduleResponse['scheduleByDay']>[string]
type ScheduleSlot = ScheduleDay['slots'][number]
type Subject = StudentScheduleResponse['subjects'][number]

interface ExtraClassScheduleData {
  extraClassName: string
  teacherName: string
  schedules: Array<{ weekDay: number; startTime: string; endTime: string }>
}

const EXTRA_CLASS_DAY_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sab',
}

interface StudentScheduleContainerProps {
  studentId: string
  studentName: string
}

const TYPE_COLORS: Record<string, string> = {
  MORNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  AFTERNOON: 'bg-orange-100 text-orange-800 border-orange-200',
  EVENING: 'bg-purple-100 text-purple-800 border-purple-200',
  NIGHT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  CUSTOM: 'bg-gray-100 text-gray-800 border-gray-200',
}

const TYPE_LABELS: Record<string, string> = {
  MORNING: 'Manha',
  AFTERNOON: 'Tarde',
  EVENING: 'Noite',
  NIGHT: 'Noturno',
  CUSTOM: 'Personalizado',
}

const DAY_SHORT_LABELS: Record<string, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sab',
  SUNDAY: 'Dom',
}

export function StudentScheduleContainer({
  studentId,
  studentName,
}: StudentScheduleContainerProps) {
  const { data, isLoading, error, refetch } = useQuery(useStudentScheduleQueryOptions(studentId))

  if (isLoading) {
    return <StudentScheduleContainerSkeleton />
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-4 py-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Erro ao carregar horário</h3>
            <p className="text-sm text-muted-foreground">
              {error.message || 'Ocorreu um erro inesperado'}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  // Se a API retornou uma mensagem (ex: aluno sem turma, sem período letivo, etc.)
  if (data.message) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Grade horaria indisponivel</h3>
          <p className="mt-2 text-sm text-muted-foreground">{data.message}</p>
        </CardContent>
      </Card>
    )
  }

  const days = Object.entries(data.scheduleByDay || {})
  const hasSchedule = days.length > 0

  return (
    <div className="space-y-6">
      {/* Class Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Turma</p>
              <p className="font-medium">{data.className}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      {data.subjects && data.subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Disciplinas de {studentName}
            </CardTitle>
            <CardDescription>{data.subjects.length} disciplinas matriculadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.subjects.map((subject: Subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">{subject.name}</span>
                  {subject.teacherName && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {subject.teacherName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra Class Schedules */}
      {(data as any).extraClassSchedules && (data as any).extraClassSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              Aulas Avulsas
            </CardTitle>
            <CardDescription>
              {(data as any).extraClassSchedules.length} aula(s) extracurricular(es)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {((data as any).extraClassSchedules as ExtraClassScheduleData[]).map((ec) => (
                <div
                  key={ec.extraClassName}
                  className="p-3 border rounded-lg border-purple-200 bg-purple-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-900">{ec.extraClassName}</span>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      Avulsa
                    </Badge>
                  </div>
                  {ec.teacherName && (
                    <p className="text-sm text-purple-700 flex items-center gap-1 mb-2">
                      <User className="h-3 w-3" />
                      {ec.teacherName}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {ec.schedules.map((s, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-800"
                      >
                        {EXTRA_CLASS_DAY_LABELS[s.weekDay]} {s.startTime}-{s.endTime}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Grade Horaria
          </CardTitle>
          <CardDescription>Horarios semanais de aula</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSchedule ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Horário não definido</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A grade horária ainda não foi configurada para esta turma.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-muted-foreground border-b">
                        Horario
                      </th>
                      {days.map(([day, _dayData]: [string, ScheduleDay]) => (
                        <th
                          key={day}
                          className="p-3 text-center text-sm font-medium border-b min-w-[120px]"
                        >
                          {DAY_SHORT_LABELS[day]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Get unique time slots */}
                    {(() => {
                      const allSlots = days.flatMap(([_, dayData]: [string, ScheduleDay]) =>
                        dayData.slots.map((slot: any) => ({
                          time: `${slot.startTime} - ${slot.endTime}`,
                          type: slot.type,
                        }))
                      )
                      const uniqueSlots = Array.from(
                        new Map(allSlots.map((s) => [s.time, s])).values()
                      ).sort((a, b) => a.time.localeCompare(b.time))

                      return uniqueSlots.map((timeSlot) => (
                        <tr key={timeSlot.time} className="border-b last:border-0">
                          <td className="p-3 text-sm font-medium">
                            {timeSlot.time}
                            <Badge
                              variant="outline"
                              className={`ml-2 text-xs ${TYPE_COLORS[timeSlot.type] || ''}`}
                            >
                              {TYPE_LABELS[timeSlot.type] || timeSlot.type}
                            </Badge>
                          </td>
                          {days.map(([day, dayData]: [string, ScheduleDay]) => {
                            const slot = dayData.slots.find(
                              (s: ScheduleSlot) => `${s.startTime} - ${s.endTime}` === timeSlot.time
                            )
                            return (
                              <td key={day} className="p-3 text-center">
                                {slot?.subject ? (
                                  <div>
                                    <p className="font-medium text-sm">{slot.subject.name}</p>
                                    {slot.teacherName && (
                                      <p className="text-xs text-muted-foreground">
                                        {slot.teacherName}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Cards by day */}
              <div className="md:hidden space-y-4">
                {days.map(([day, dayData]: [string, ScheduleDay]) => (
                  <Card key={day}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{dayData.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                      <div className="space-y-2">
                        {dayData.slots.map((slot: any) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${TYPE_COLORS[slot.type] || ''}`}
                              >
                                {TYPE_LABELS[slot.type] || slot.type}
                              </Badge>
                            </div>
                            {slot.subject ? (
                              <div className="text-right">
                                <p className="font-medium">{slot.subject.name}</p>
                                {slot.teacherName && (
                                  <p className="text-xs text-muted-foreground">
                                    {slot.teacherName}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem aula</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentScheduleContainerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
