import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, BookOpen } from 'lucide-react'

import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { SubjectGradesTable } from '../../../../../../../../containers/turma'
import { api } from '~/lib/api'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
  classId: string
  academicPeriodId: string
  courseId: string
  className: string
  courseName: string
  academicPeriodName: string
}

interface Subject {
  id: string
  name: string
}

function NotasSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function NotasEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhuma matéria</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Não há matérias cadastradas para esta turma.
      </p>
    </div>
  )
}

export default function TurmaNotasPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  academicPeriodId,
  courseId,
  className,
  courseName,
}: Props) {
  const { data: classData, isLoading } = useQuery(
    api.api.v1.classes.show.queryOptions({ params: { id: classId } })
  )

  const subjects = useMemo(() => {
    if (!classData) return []
    const result: Subject[] = []
    const seen = new Set<string>()
    const teacherClasses = classData.teacherClasses || []
    for (const tc of teacherClasses) {
      if (tc.subject && !seen.has(tc.subject.id)) {
        seen.add(tc.subject.id)
        result.push({ id: tc.subject.id, name: tc.subject.name })
      }
    }
    return result
  }, [classData])

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const effectiveSubjectId = selectedSubjectId ?? subjects[0]?.id ?? null
  const selectedSubject = subjects.find((s) => s.id === effectiveSubjectId)

  return (
    <TurmaLayout
      turmaName={className}
      courseName={courseName}
      academicPeriodSlug={academicPeriodSlug}
      courseSlug={courseSlug}
      classSlug={classSlug}
      screenId="escola_turma_notas"
      classId={classId}
      courseId={courseId}
      academicPeriodId={academicPeriodId}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notas por Matéria</CardTitle>
              <CardDescription>
                Visualize as notas dos alunos agrupadas por matéria
              </CardDescription>
            </div>
            {subjects.length > 0 && (
              <div className="w-64">
                <Select
                  value={effectiveSubjectId ?? ''}
                  onValueChange={(value) => setSelectedSubjectId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a matéria">
                      {selectedSubject?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NotasSkeleton />
          ) : subjects.length === 0 ? (
            <NotasEmpty />
          ) : !effectiveSubjectId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4" />
              <p>Selecione uma matéria para ver as notas.</p>
            </div>
          ) : (
            <SubjectGradesTable
              classId={classId}
              subjectId={effectiveSubjectId}
              courseId={courseId}
              academicPeriodId={academicPeriodId}
            />
          )}
        </CardContent>
      </Card>
    </TurmaLayout>
  )
}
