import { useState, Fragment } from 'react'
import { Users, Loader2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Badge } from '~/components/ui/badge'

import { useStudentStatus, type StudentStatusData, type StudentStatus } from '~/hooks/queries/use-student-status'

interface StudentStatusTableProps {
  classId: string
  subjectId: string | null
}

const STATUS_CONFIG: Record<
  StudentStatus,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  APPROVED: { variant: 'default', label: 'Aprovado' },
  AT_RISK_GRADE: { variant: 'secondary', label: 'Risco - Nota' },
  AT_RISK_ATTENDANCE: { variant: 'secondary', label: 'Risco - Falta' },
  FAILED: { variant: 'destructive', label: 'Reprovado' },
  IN_PROGRESS: { variant: 'outline', label: 'Em Andamento' },
}

function StatusTableSkeleton() {
  return (
    <div className="py-12 text-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Carregando situação dos alunos...</p>
    </div>
  )
}

function StatusTableError() {
  return (
    <div className="py-12 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold text-destructive">Erro ao carregar dados</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Não foi possível carregar a situação dos alunos.
      </p>
    </div>
  )
}

function NoSubjectSelected() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Selecione uma matéria</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha uma matéria para ver a situação dos alunos.
      </p>
    </div>
  )
}

function NoStudents() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhum aluno encontrado</h3>
      <p className="mt-2 text-sm text-muted-foreground">Não há alunos matriculados nesta turma.</p>
    </div>
  )
}

function NoAtRiskStudents() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhum aluno em risco</h3>
      <p className="mt-2 text-sm text-muted-foreground">Todos os alunos estão com bom desempenho!</p>
    </div>
  )
}

interface StudentRowProps {
  student: StudentStatusData
  isExpanded: boolean
  onToggle: () => void
}

function StudentRow({ student, isExpanded, onToggle }: StudentRowProps) {
  const config = STATUS_CONFIG[student.status]
  const hasMissedAssignments = student.missedAssignments.length > 0

  return (
    <Fragment>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-12">
          {hasMissedAssignments && (
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </TableCell>
        <TableCell>
          <span className="font-medium">{student.name}</span>
        </TableCell>
        <TableCell className="text-center">
          <Badge
            variant={config.variant}
            className={student.status === 'IN_PROGRESS' ? 'bg-blue-50' : ''}
          >
            {config.label}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          {student.status === 'IN_PROGRESS' ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            <>
              <span className="font-semibold">{student.finalGrade.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                {' '}
                / {student.maxPossibleGrade.toFixed(1)}
              </span>
            </>
          )}
        </TableCell>
        <TableCell className="text-center">
          {student.pointsUntilPass !== null && student.pointsUntilPass > 0 ? (
            <span className="font-medium text-yellow-600">{student.pointsUntilPass.toFixed(1)} pts</span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          <span>{student.attendancePercentage.toFixed(1)}%</span>
        </TableCell>
        <TableCell className="text-center">
          {student.classesUntilFail !== null ? (
            <span className="font-medium text-orange-600">
              {student.classesUntilFail} aula{student.classesUntilFail !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          {student.missedAssignments.length === 0 ? (
            <Badge variant="outline" className="bg-green-50">
              Tudo em dia
            </Badge>
          ) : (
            <Badge variant="secondary">
              {student.missedAssignments.length} pendente
              {student.missedAssignments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </TableCell>
      </TableRow>
      {isExpanded && hasMissedAssignments && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">
                Atividades Não Entregues ({student.missedAssignments.length})
              </h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {student.missedAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-md border bg-background p-2">
                    <p className="text-sm font-medium">{assignment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}

export function StudentStatusTable({ classId, subjectId }: StudentStatusTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showOnlyAtRisk, setShowOnlyAtRisk] = useState(false)

  const { data: students, isLoading, isError } = useStudentStatus({
    classId,
    subjectId,
    enabled: !!subjectId,
  })

  if (!subjectId) {
    return <NoSubjectSelected />
  }

  if (isLoading) {
    return <StatusTableSkeleton />
  }

  if (isError) {
    return <StatusTableError />
  }

  if (!students || students.length === 0) {
    return <NoStudents />
  }

  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedRows(newExpanded)
  }

  // Filter students - "at risk" are those not approved and not in progress
  const filteredStudents = showOnlyAtRisk
    ? students.filter((s) => s.status !== 'APPROVED' && s.status !== 'IN_PROGRESS')
    : students

  const atRiskCount = students.filter(
    (s) => s.status !== 'APPROVED' && s.status !== 'IN_PROGRESS'
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <p>
            Total de {students.length} aluno(s) &bull; {atRiskCount} em risco
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="filter-at-risk"
            checked={showOnlyAtRisk}
            onCheckedChange={setShowOnlyAtRisk}
          />
          <Label htmlFor="filter-at-risk" className="cursor-pointer">
            Mostrar apenas alunos em risco
          </Label>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <NoAtRiskStudents />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Aluno</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Nota Final</TableHead>
                <TableHead className="text-center">Pontos p/ Passar</TableHead>
                <TableHead className="text-center">Presença</TableHead>
                <TableHead className="text-center">Aulas até Reprovar</TableHead>
                <TableHead className="text-center">Atividades Pendentes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  isExpanded={expandedRows.has(student.id)}
                  onToggle={() => toggleRow(student.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
