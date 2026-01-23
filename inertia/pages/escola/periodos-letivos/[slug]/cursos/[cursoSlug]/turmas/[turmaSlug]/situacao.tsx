import { useState, useMemo } from 'react'

import { EscolaLayout } from '~/components/layouts/escola-layout'
import { TurmaLayout } from '~/components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { StudentStatusTable } from '~/containers/turma'

const DIRECTOR_ROLES = ['SCHOOL_DIRECTOR', 'SCHOOL_COORDINATOR', 'ADMIN', 'SUPER_ADMIN']

interface Subject {
  id: string
  name: string
  slug: string
  teacherUserId: string
}

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
  subjects: Subject[]
  currentUserId: string | null
  currentUserRole: string
}

export default function TurmaSituacaoPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  academicPeriodId,
  courseId,
  className,
  courseName,
  subjects,
  currentUserId,
  currentUserRole,
}: Props) {
  // Filter subjects based on user role
  const filteredSubjects = useMemo(() => {
    const isDirectorOrAdmin = DIRECTOR_ROLES.includes(currentUserRole)
    if (isDirectorOrAdmin) {
      return subjects
    }
    // Teachers only see their subjects
    return subjects.filter((s) => s.teacherUserId === currentUserId)
  }, [subjects, currentUserId, currentUserRole])

  // Auto-select first subject
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    filteredSubjects.length > 0 ? filteredSubjects[0]?.id ?? null : null
  )

  return (
    <EscolaLayout>
      <TurmaLayout
        turmaName={className}
        courseName={courseName}
        academicPeriodSlug={academicPeriodSlug}
        courseSlug={courseSlug}
        classSlug={classSlug}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Situação dos Alunos</CardTitle>
                <CardDescription>
                  Acompanhe o desempenho e presença dos alunos na turma
                </CardDescription>
              </div>
              {filteredSubjects.length > 0 && (
                <div className="w-64">
                  <Select
                    value={selectedSubjectId ?? undefined}
                    onValueChange={(value) => setSelectedSubjectId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((subject) => (
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
            <StudentStatusTable classId={classId} courseId={courseId} academicPeriodId={academicPeriodId} subjectId={selectedSubjectId} />
          </CardContent>
        </Card>
      </TurmaLayout>
    </EscolaLayout>
  )
}
