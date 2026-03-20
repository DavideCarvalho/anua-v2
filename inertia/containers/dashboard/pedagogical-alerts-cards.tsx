import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingDown, FileText, Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Route } from '@tuyau/core/types'

import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '~/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '~/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

type AlertsResponse = Route.Response<'api.v1.dashboard.escola_pedagogical_alerts'>
type PedagogicalAlerts = AlertsResponse['alerts']

type AlertKey = keyof PedagogicalAlerts

interface AlertCardConfig {
  key: AlertKey
  title: string
  icon: LucideIcon
  color: string
  bgClass: string
}

const alertConfigs: AlertCardConfig[] = [
  {
    key: 'studentsAtRiskByAttendance',
    title: 'Risco de Reprovação por Frequência',
    icon: Users,
    color: 'text-destructive',
    bgClass: 'bg-destructive/10 hover:bg-destructive/20 border-l-destructive',
  },
  {
    key: 'studentsAtRiskByGrade',
    title: 'Risco de Reprovação por Nota',
    icon: TrendingDown,
    color: 'text-destructive',
    bgClass: 'bg-destructive/10 hover:bg-destructive/20 border-l-destructive',
  },
  {
    key: 'examsWithoutGrades',
    title: 'Provas Sem Notas',
    icon: FileText,
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-l-amber-500',
  },
  {
    key: 'overdueActivities',
    title: 'Atividades Vencidas Sem Notas',
    icon: Calendar,
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-l-amber-500',
  },
  {
    key: 'ungradedSubmissions',
    title: 'Notas Pendentes',
    icon: CheckCircle,
    color: 'text-blue-500',
    bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-l-blue-500',
  },
  {
    key: 'teachersMissingAttendance',
    title: 'Professores Sem Presença',
    icon: Clock,
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-l-amber-500',
  },
]

interface PedagogicalAlertsCardsProps {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

export function PedagogicalAlertsCards({
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: PedagogicalAlertsCardsProps) {
  const query = { academicPeriodId, courseId, levelId, classId }

  return (
    <DashboardCardBoundary
      title="Alertas Pedagógicos"
      queryKeys={[
        api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({ query } as any).queryKey,
      ]}
    >
      <PedagogicalAlertsCardsContent
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
      />
    </DashboardCardBoundary>
  )
}

function PedagogicalAlertsCardsContent({
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: PedagogicalAlertsCardsProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertKey | null>(null)

  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({
      query: { academicPeriodId, courseId, levelId, classId },
    } as any)
  )

  const alerts = data?.alerts

  if (isLoading || !alerts) {
    return <PedagogicalAlertsCardsSkeleton />
  }

  const visibleAlerts = alertConfigs.filter((config) => {
    const alertData = alerts[config.key]
    return alertData && alertData.count > 0
  })

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-7">
          <div className="min-h-[116px] text-center flex flex-col items-center justify-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <h3 className="text-base font-semibold text-green-700">Tudo em ordem!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Não há alertas pedagógicos no momento
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleAlerts.map((config) => {
          const alertData = alerts[config.key]!
          const Icon = config.icon

          return (
            <Card
              key={config.key}
              className={cn(
                'cursor-pointer transition-colors border-l-4 border-l-transparent',
                config.bgClass
              )}
              onClick={() => setSelectedAlert(config.key)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    {config.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alertData.count}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAlertDescription(config.key, alertData)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedAlert && (
        <AlertDetailSheet
          alertKey={selectedAlert}
          alerts={alerts}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  )
}

function getAlertDescription(
  key: AlertKey,
  data: NonNullable<PedagogicalAlerts[AlertKey]>
): string {
  if (key === 'studentsAtRiskByAttendance' && 'threshold' in data) {
    return `Alunos com frequência abaixo de ${data.threshold}% de presença`
  }
  if (key === 'studentsAtRiskByGrade' && 'minimumGrade' in data) {
    return `Alunos com média abaixo de ${data.minimumGrade}`
  }
  if (key === 'examsWithoutGrades') {
    return 'Provas realizadas sem notas lançadas'
  }
  if (key === 'overdueActivities') {
    return 'Atividades vencidas com notas pendentes'
  }
  if (key === 'ungradedSubmissions') {
    return 'Alunos com notas pendentes de lançamento'
  }
  if (key === 'teachersMissingAttendance' && 'daysThreshold' in data) {
    return `Sem registro há ${data.daysThreshold}+ dias`
  }
  return ''
}

function AlertDetailSheet({
  alertKey,
  alerts,
  onClose,
}: {
  alertKey: AlertKey
  alerts: PedagogicalAlerts
  onClose: () => void
}) {
  const alertData = alerts[alertKey]
  if (!alertData) return null

  return (
    <Sheet open={!!alertKey} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getSheetTitle(alertKey)}</SheetTitle>
          <SheetDescription>{getSheetDescription(alertKey, alertData)}</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {alertKey === 'studentsAtRiskByAttendance' && 'students' in alertData && (
            <StudentsAtRiskByAttendanceTable
              data={alertData as NonNullable<PedagogicalAlerts['studentsAtRiskByAttendance']>}
            />
          )}
          {alertKey === 'studentsAtRiskByGrade' && 'students' in alertData && (
            <StudentsAtRiskByGradeTable
              data={alertData as NonNullable<PedagogicalAlerts['studentsAtRiskByGrade']>}
            />
          )}
          {alertKey === 'examsWithoutGrades' && 'exams' in alertData && (
            <ExamsWithoutGradesTable
              data={alertData as NonNullable<PedagogicalAlerts['examsWithoutGrades']>}
            />
          )}
          {alertKey === 'overdueActivities' && 'activities' in alertData && (
            <OverdueActivitiesTable
              data={alertData as NonNullable<PedagogicalAlerts['overdueActivities']>}
            />
          )}
          {alertKey === 'ungradedSubmissions' && 'submissions' in alertData && (
            <UngradedSubmissionsTable
              data={alertData as NonNullable<PedagogicalAlerts['ungradedSubmissions']>}
            />
          )}
          {alertKey === 'teachersMissingAttendance' && 'teachers' in alertData && (
            <TeachersMissingAttendanceTable
              data={alertData as NonNullable<PedagogicalAlerts['teachersMissingAttendance']>}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StudentsAtRiskByAttendanceTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['studentsAtRiskByAttendance']>
}) {
  const sorted = [...data.students].sort((a, b) => {
    if (a.totalClasses === 0 && b.totalClasses !== 0) return -1
    if (b.totalClasses === 0 && a.totalClasses !== 0) return 1
    return a.absenceRate - b.absenceRate
  })

  // Group by course + level
  const courseLevels = [...new Set(sorted.map((s) => `${s.courseName} - ${s.levelName}`))]

  const renderTable = (students: typeof sorted) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead className="text-center">Faltas/Aulas</TableHead>
          <TableHead className="text-center">Presença</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => {
          const hasNoDataAtAll = student.totalClasses === 0
          const attendanceRate = hasNoDataAtAll ? 0 : 100 - student.absenceRate
          const isNoRecords = hasNoDataAtAll || attendanceRate === 0
          const isBelowThreshold = !isNoRecords && attendanceRate < 75

          const displayRate = Math.round(attendanceRate)
          let badgeClass = ''
          let tooltipText = ''

          if (hasNoDataAtAll) {
            badgeClass = 'bg-red-500'
            tooltipText = 'Aluno sem registros de presença. Necessário verificar situação.'
          } else if (isNoRecords) {
            badgeClass = 'bg-red-500'
            tooltipText =
              'Nenhuma presença registrada para este aluno. Verifique se está frequentando as aulas.'
          } else if (isBelowThreshold) {
            badgeClass = 'bg-red-500'
            tooltipText = `Frequência de ${displayRate}%, abaixo do mínimo de 75%. Risco de reprovação por falta.`
          } else {
            badgeClass = 'bg-yellow-500 text-yellow-950'
            tooltipText = `Frequência de ${displayRate}%. Padrão de faltas indica risco de reprovação se continuar.`
          }

          return (
            <TableRow key={student.studentId}>
              <TableCell className="font-medium">{student.studentName}</TableCell>
              <TableCell>{student.className}</TableCell>
              <TableCell className="text-center">
                {student.totalClasses > 0 ? `${student.absences}/${student.totalClasses}` : '-'}
              </TableCell>
              <TableCell className="text-center">
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className={badgeClass}>
                      {hasNoDataAtAll ? 'Sem registros' : `${displayRate}%`}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{tooltipText}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  return (
    <TooltipProvider>
      <Tabs defaultValue={courseLevels[0]}>
        <TabsList>
          {courseLevels.map((label) => (
            <TabsTrigger key={label} value={label}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {courseLevels.map((label) => {
          const courseStudents = sorted.filter((s) => `${s.courseName} - ${s.levelName}` === label)
          return (
            <TabsContent key={label} value={label}>
              {renderTable(courseStudents)}
            </TabsContent>
          )
        })}
      </Tabs>
    </TooltipProvider>
  )
}

function StudentsAtRiskByGradeTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['studentsAtRiskByGrade']>
}) {
  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        Cálculo:{' '}
        <Badge variant="outline">
          {data.calculationAlgorithm === 'AVERAGE' ? 'Média' : 'Soma'}
        </Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead className="text-center">Média</TableHead>
            <TableHead className="text-center">Mínimo</TableHead>
            <TableHead className="text-center">Déficit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.students.map((student) => (
            <TableRow key={student.studentId}>
              <TableCell className="font-medium">{student.studentName}</TableCell>
              <TableCell>{student.className}</TableCell>
              <TableCell className="text-center">
                <Badge variant="destructive">{student.averageGrade.toFixed(1)}</Badge>
              </TableCell>
              <TableCell className="text-center">{student.minimumRequired}</TableCell>
              <TableCell className="text-center text-red-600 font-medium">
                -{student.deficit.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

function ExamsWithoutGradesTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['examsWithoutGrades']>
}) {
  const courseLevels = [...new Set(data.exams.map((e) => `${e.courseName} - ${e.levelName}`))]

  const getDaysBadge = (days: number) => {
    if (days >= 10) {
      return <Badge className="bg-red-500">{days} dias</Badge>
    }
    return <Badge className="bg-yellow-500 text-yellow-950">{days} dias</Badge>
  }

  const renderTable = (exams: typeof data.exams) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prova</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead>Professor</TableHead>
          <TableHead className="text-center">Data</TableHead>
          <TableHead className="text-center">Atraso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.examId}>
            <TableCell className="font-medium">{exam.examTitle}</TableCell>
            <TableCell>{exam.className}</TableCell>
            <TableCell>{exam.teacherName}</TableCell>
            <TableCell className="text-center">
              {new Date(exam.examDate).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-center">{getDaysBadge(exam.daysPast)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Tabs defaultValue={courseLevels[0]}>
      <TabsList>
        {courseLevels.map((label) => (
          <TabsTrigger key={label} value={label}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {courseLevels.map((label) => {
        const courseExams = data.exams.filter((e) => `${e.courseName} - ${e.levelName}` === label)
        return (
          <TabsContent key={label} value={label}>
            {renderTable(courseExams)}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

function OverdueActivitiesTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['overdueActivities']>
}) {
  const courseLevels = [...new Set(data.activities.map((a) => `${a.courseName} - ${a.levelName}`))]

  const getDaysBadge = (days: number) => {
    if (days >= 10) {
      return <Badge className="bg-red-500">{days} dias</Badge>
    }
    return <Badge className="bg-yellow-500 text-yellow-950">{days} dias</Badge>
  }

  const renderTable = (activities: typeof data.activities) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Atividade</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead>Professor</TableHead>
          <TableHead className="text-center">Notas</TableHead>
          <TableHead className="text-center">Atraso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.assignmentId}>
            <TableCell className="font-medium">{activity.assignmentName}</TableCell>
            <TableCell>{activity.className}</TableCell>
            <TableCell>{activity.teacherName}</TableCell>
            <TableCell className="text-center">
              <Badge variant={activity.gradedStudents === 0 ? 'destructive' : 'secondary'}>
                {activity.gradedStudents}/{activity.totalStudents}
              </Badge>
            </TableCell>
            <TableCell className="text-center">{getDaysBadge(activity.daysPast)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Tabs defaultValue={courseLevels[0]}>
      <TabsList>
        {courseLevels.map((label) => (
          <TabsTrigger key={label} value={label}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {courseLevels.map((label) => {
        const courseActivities = data.activities.filter(
          (a) => `${a.courseName} - ${a.levelName}` === label
        )
        return (
          <TabsContent key={label} value={label}>
            {renderTable(courseActivities)}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

function UngradedSubmissionsTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['ungradedSubmissions']>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead>Atividade</TableHead>
          <TableHead className="text-center">Registrado</TableHead>
          <TableHead className="text-center">Aguardando</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.submissions.map((submission) => (
          <TableRow key={submission.submissionId}>
            <TableCell className="font-medium">{submission.studentName}</TableCell>
            <TableCell>{submission.className}</TableCell>
            <TableCell>{submission.assignmentName}</TableCell>
            <TableCell className="text-center">
              {new Date(submission.submittedAt).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary">{submission.daysWaiting} dias</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function TeachersMissingAttendanceTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['teachersMissingAttendance']>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Professor</TableHead>
          <TableHead>Turmas</TableHead>
          <TableHead className="text-center">Sem registro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.teachers.map((teacher) => (
          <TableRow key={teacher.teacherId}>
            <TableCell className="font-medium">{teacher.teacherName}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {teacher.classes.slice(0, 3).map((cls, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {cls}
                  </Badge>
                ))}
                {teacher.classes.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{teacher.classes.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="destructive">{teacher.daysWithoutAttendance} dias</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function getSheetTitle(key: AlertKey): string {
  const titles: Record<AlertKey, string> = {
    studentsAtRiskByAttendance: 'Alunos em Risco por Frequência',
    studentsAtRiskByGrade: 'Alunos em Risco por Nota',
    examsWithoutGrades: 'Provas Sem Notas Lançadas',
    overdueActivities: 'Atividades Vencidas Sem Notas',
    ungradedSubmissions: 'Notas Pendentes',
    teachersMissingAttendance: 'Professores Sem Registro de Presença',
  }
  return titles[key]
}

function getSheetDescription(
  key: AlertKey,
  data: NonNullable<PedagogicalAlerts[AlertKey]>
): string {
  if (key === 'studentsAtRiskByAttendance' && 'threshold' in data) {
    return `${data.count} aluno(s) com taxa de falta elevada ou sem registros de presença (mínimo ${data.threshold}% de presença exigido)`
  }
  if (key === 'studentsAtRiskByGrade' && 'minimumGrade' in data) {
    return `${data.count} aluno(s) com média abaixo de ${data.minimumGrade}`
  }
  if (key === 'teachersMissingAttendance' && 'daysThreshold' in data) {
    return `${data.count} professor(es) sem registro de presença há ${data.daysThreshold}+ dias`
  }
  return `${data.count} item(s) encontrados`
}

function PedagogicalAlertsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-48 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
