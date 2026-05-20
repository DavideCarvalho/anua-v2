import { useState, useMemo } from 'react'
import type React from 'react'

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
import { SubPeriodFilter } from '~/containers/academic-periods/components/sub-period-filter'

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

const TurmaSituacaoPage: React.FC<Props> = ({
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
}) => {
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
    filteredSubjects.length > 0 ? (filteredSubjects[0]?.id ?? null) : null
  )
  const [subPeriodId, setSubPeriodId] = useState('')
  const selectedSubject = filteredSubjects.find((subject) => subject.id === selectedSubjectId)

  return (
    <TurmaLayout
      turmaName={className}
      courseName={courseName}
      academicPeriodSlug={academicPeriodSlug}
      courseSlug={courseSlug}
      classSlug={classSlug}
      screenId="escola_turma_situacao"
      classId={classId}
      courseId={courseId}
      academicPeriodId={academicPeriodId}
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
                    <SelectValue placeholder="Selecione a matéria">
                      {selectedSubject?.name}
                    </SelectValue>
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
        <CardContent className="space-y-4">
          <SubPeriodFilter
            academicPeriodId={academicPeriodId}
            value={subPeriodId}
            onChange={setSubPeriodId}
          />
          <StudentStatusTable
            classId={classId}
            courseId={courseId}
            academicPeriodId={academicPeriodId}
            subjectId={selectedSubjectId}
            subPeriodId={subPeriodId}
          />
        </CardContent>
      </Card>
    </TurmaLayout>
  )
}

export default TurmaSituacaoPage
