import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Loader2, Users, AlertCircle, ClipboardList } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ErrorBoundary } from '~/components/error-boundary'
import { LaunchGradesModal } from './launch-grades-modal'

interface SubjectGradesTableProps {
  classId: string
  subjectId: string
}

interface StudentGrade {
  id: string
  name: string
  finalGrade: number
  gradedCount: number
  totalCount: number
  maxPossibleGrade: number
  grades: {
    assignment: {
      id: string
      name: string
      maxGrade: number
    }
    grade: number | null
  }[]
}

interface GradesResponse {
  data: StudentGrade[]
}

async function fetchSubjectGrades(
  classId: string,
  subjectId: string
): Promise<GradesResponse> {
  const response = await fetch(`/api/v1/grades/class/${classId}/subject/${subjectId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch grades')
  }
  return response.json()
}

function GradesTableSkeleton() {
  return (
    <div className="py-8 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Carregando notas...</p>
    </div>
  )
}

function GradesTableError() {
  return (
    <div className="py-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
      <p className="mt-2 text-sm text-destructive">Erro ao carregar notas</p>
    </div>
  )
}

function GradesTableEmpty() {
  return (
    <div className="py-8 text-center">
      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Nenhum aluno encontrado</p>
    </div>
  )
}

interface SelectedAssignment {
  id: string
  name: string
  maxGrade: number
}

function SubjectGradesTableContent({ classId, subjectId }: SubjectGradesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment | null>(null)

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['subject-grades', classId, subjectId],
    queryFn: () => fetchSubjectGrades(classId, subjectId),
  })

  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedRows(newExpanded)
  }

  if (isLoading) {
    return <GradesTableSkeleton />
  }

  if (isError || !response) {
    return <GradesTableError />
  }

  const students = Array.isArray(response) ? response : response.data || []

  if (students.length === 0) {
    return <GradesTableEmpty />
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {students.length} aluno(s)
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead className="text-center">Nota Final</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Atividades</TableHead>
              <TableHead className="text-center">Nota Máxima</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const isExpanded = expandedRows.has(student.id)
              const passingGrade = student.maxPossibleGrade * 0.6
              const isPassing = student.finalGrade >= passingGrade
              const hasActivities = student.totalCount > 0

              return (
                <Fragment key={student.id}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(student.id)}
                        className="h-8 w-8 p-0"
                        disabled={student.totalCount === 0}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-center">
                      {hasActivities ? (
                        <span className="font-semibold">{student.finalGrade.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {hasActivities ? (
                        <Badge variant={isPassing ? 'default' : 'destructive'}>
                          {isPassing ? 'Aprovado' : 'Reprovado'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Sem atividades</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {student.gradedCount}/{student.totalCount} avaliadas
                    </TableCell>
                    <TableCell className="text-center">
                      {hasActivities ? (
                        <span>{student.maxPossibleGrade.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && student.grades.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30 p-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Notas Individuais</h4>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {student.grades.map((gradeItem) => (
                              <div
                                key={gradeItem.assignment.id}
                                className="flex items-center justify-between rounded-md border bg-background p-2"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {gradeItem.assignment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Máx: {gradeItem.assignment.maxGrade}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold">
                                    {gradeItem.grade !== null
                                      ? gradeItem.grade.toFixed(1)
                                      : '-'}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() =>
                                      setSelectedAssignment({
                                        id: gradeItem.assignment.id,
                                        name: gradeItem.assignment.name,
                                        maxGrade: gradeItem.assignment.maxGrade,
                                      })
                                    }
                                  >
                                    <ClipboardList className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedAssignment && (
        <LaunchGradesModal
          assignmentId={selectedAssignment.id}
          assignmentName={selectedAssignment.name}
          maxGrade={selectedAssignment.maxGrade}
          classId={classId}
          open={!!selectedAssignment}
          onOpenChange={(open) => {
            if (!open) setSelectedAssignment(null)
          }}
        />
      )}
    </div>
  )
}

export function SubjectGradesTable(props: SubjectGradesTableProps) {
  return (
    <ErrorBoundary>
      <SubjectGradesTableContent {...props} />
    </ErrorBoundary>
  )
}
