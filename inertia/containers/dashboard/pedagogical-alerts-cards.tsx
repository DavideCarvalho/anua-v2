import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingDown, FileText, Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Route } from '@tuyau/core/types'

import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
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

export function PedagogicalAlertsCards() {
  const [selectedAlert, setSelectedAlert] = useState<AlertKey | null>(null)

  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({})
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
        <CardContent className="py-12">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700">Tudo em ordem!</h3>
            <p className="text-sm text-muted-foreground mt-1">
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
    return `Alunos com frequência abaixo de ${data.threshold}%`
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
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto">
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead className="text-center">Faltas</TableHead>
          <TableHead className="text-center">Taxa</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.students.map((student) => (
          <TableRow key={student.studentId}>
            <TableCell className="font-medium">{student.studentName}</TableCell>
            <TableCell>{student.className}</TableCell>
            <TableCell className="text-center">{student.absences}</TableCell>
            <TableCell className="text-center">
              <Badge variant="destructive">{student.absenceRate}%</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  return (
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
        {data.exams.map((exam) => (
          <TableRow key={exam.examId}>
            <TableCell className="font-medium">{exam.examTitle}</TableCell>
            <TableCell>{exam.className}</TableCell>
            <TableCell>{exam.teacherName}</TableCell>
            <TableCell className="text-center">
              {new Date(exam.examDate).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary">{exam.daysPast} dias</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function OverdueActivitiesTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['overdueActivities']>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Atividade</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead>Professor</TableHead>
          <TableHead className="text-center">Notas</TableHead>
          <TableHead className="text-center">Vencimento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.activities.map((activity) => (
          <TableRow key={activity.assignmentId}>
            <TableCell className="font-medium">{activity.assignmentName}</TableCell>
            <TableCell>{activity.className}</TableCell>
            <TableCell>{activity.teacherName}</TableCell>
            <TableCell className="text-center">
              <Badge variant={activity.gradedStudents === 0 ? 'destructive' : 'secondary'}>
                {activity.gradedStudents}/{activity.totalStudents}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              {new Date(activity.dueDate).toLocaleDateString('pt-BR')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
    return `${data.count} aluno(s) com frequência abaixo de ${data.threshold}%`
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
