import type { Route } from '@tuyau/core/types'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '~/components/ui/tooltip'

type AlertsResponse = Route.Response<'api.v1.dashboard.escola_pedagogical_alerts'>
export type PedagogicalAlerts = AlertsResponse['alerts']
export type PedagogicalAlertKey = keyof PedagogicalAlerts

interface PedagogicalAlertSheetProps {
  alertKey: PedagogicalAlertKey
  alerts: PedagogicalAlerts
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PedagogicalAlertSheet({
  alertKey,
  alerts,
  open,
  onOpenChange,
}: PedagogicalAlertSheetProps) {
  const alertData = alerts[alertKey]
  if (!alertData) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
          {alertKey === 'unacknowledgedAnnouncements' && 'announcements' in alertData && (
            <UnacknowledgedAnnouncementsTable
              data={alertData as NonNullable<PedagogicalAlerts['unacknowledgedAnnouncements']>}
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
            tooltipText =
              'Sem presença lançada para este aluno. Verifique a situação da frequência.'
          } else if (isNoRecords) {
            badgeClass = 'bg-red-500'
            tooltipText =
              'Nenhuma presença foi lançada para este aluno, apesar de já existir chamada na turma.'
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
                      {isNoRecords ? 'Sem presença lançada' : `${displayRate}%`}
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
            <TableHead>Nível</TableHead>
            <TableHead>Matérias em Risco</TableHead>
            <TableHead className="text-center">Pior Nota</TableHead>
            <TableHead className="text-center">Mínimo</TableHead>
            <TableHead className="text-center">Maior Déficit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.students.map((student) => {
            const sortedSubjects = [...student.subjectsAtRisk].sort(
              (a, b) => a.finalGrade - b.finalGrade
            )
            const worst = sortedSubjects[0]
            const maxDeficit = sortedSubjects.reduce(
              (max, subject) => Math.max(max, subject.deficit),
              0
            )

            return (
              <TableRow key={student.studentId}>
                <TableCell className="font-medium">{student.studentName}</TableCell>
                <TableCell>{student.className}</TableCell>
                <TableCell>{student.levelName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {sortedSubjects.map((subject) => (
                      <Badge
                        key={`${student.studentId}-${subject.subjectName}`}
                        variant="secondary"
                      >
                        {subject.subjectName}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="destructive">{worst?.finalGrade.toFixed(1) ?? '-'}</Badge>
                </TableCell>
                <TableCell className="text-center">{student.minimumRequired}</TableCell>
                <TableCell className="text-center text-red-600 font-medium">
                  -{maxDeficit.toFixed(1)}
                </TableCell>
              </TableRow>
            )
          })}
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

function UnacknowledgedAnnouncementsTable({
  data,
}: {
  data: NonNullable<PedagogicalAlerts['unacknowledgedAnnouncements']>
}) {
  const sorted = [...data.announcements].sort((a, b) => b.pendingRecipients - a.pendingRecipients)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Comunicado</TableHead>
          <TableHead className="text-center">Publicado</TableHead>
          <TableHead className="text-center">Visualização</TableHead>
          <TableHead className="text-right">Pendentes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((announcement) => {
          const total = announcement.totalRecipients
          const ack = announcement.acknowledgedRecipients
          const rate = total > 0 ? Math.round((ack / total) * 100) : 0
          const isCritical = rate < 50
          return (
            <TableRow key={announcement.announcementId}>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell className="text-center text-muted-foreground">
                há {announcement.daysSincePublished}{' '}
                {announcement.daysSincePublished === 1 ? 'dia' : 'dias'}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                <span className="text-muted-foreground">{ack}</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="font-medium">{total}</span>
                <span className="ml-2 text-xs text-muted-foreground">({rate}%)</span>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={isCritical ? 'destructive' : 'secondary'} className="tabular-nums">
                  {announcement.pendingRecipients}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function getSheetTitle(key: PedagogicalAlertKey): string {
  const titles: Record<PedagogicalAlertKey, string> = {
    studentsAtRiskByAttendance: 'Alunos em Risco por Frequência',
    studentsAtRiskByGrade: 'Alunos em Risco por Nota',
    examsWithoutGrades: 'Provas Sem Notas Lançadas',
    overdueActivities: 'Atividades Vencidas Sem Notas',
    ungradedSubmissions: 'Notas Pendentes',
    teachersMissingAttendance: 'Professores Sem Registro de Presença',
    unacknowledgedAnnouncements: 'Comunicados aguardando visualização',
  }
  return titles[key]
}

export function getSheetDescription(
  key: PedagogicalAlertKey,
  data: NonNullable<PedagogicalAlerts[PedagogicalAlertKey]>
): string {
  if (key === 'studentsAtRiskByAttendance' && 'threshold' in data) {
    return `${data.count} aluno(s) com frequência abaixo do mínimo ou sem presença lançada em turmas com chamada (mínimo ${data.threshold}% de presença exigido)`
  }
  if (key === 'studentsAtRiskByGrade' && 'minimumGrade' in data) {
    return `${data.count} aluno(s) com pelo menos uma matéria abaixo de ${data.minimumGrade}`
  }
  if (key === 'teachersMissingAttendance' && 'daysThreshold' in data) {
    return `${data.count} professor(es) sem registro de presença há ${data.daysThreshold}+ dias`
  }
  if (key === 'unacknowledgedAnnouncements' && 'announcementsCount' in data) {
    return `${data.count} responsável(eis) ainda não visualizou ${data.announcementsCount} comunicado(s) dos últimos ${data.daysWindow} dias`
  }
  return `${data.count} item(s) encontrados`
}
