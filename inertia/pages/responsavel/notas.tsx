import { Head } from '@inertiajs/react'
import { BookOpen } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import { useStudentSubPeriods } from '../../hooks/use_student_sub_periods'
import {
  StudentGradesContainer,
  StudentGradesContainerSkeleton,
} from '../../containers/responsavel/student-grades-container'

function NotasContent() {
  const { student, isLoaded } = useSelectedStudent()
  const { academicPeriodId, subPeriodFilter } = useStudentSubPeriods(student?.id)

  if (!isLoaded) {
    return <StudentGradesContainerSkeleton />
  }

  if (!student) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="Nenhum aluno vinculado"
            description="Você não possui alunos vinculados à sua conta."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {subPeriodFilter}
      <StudentGradesContainer
        studentId={student.id}
        studentName={student.name}
        academicPeriodId={academicPeriodId}
      />
    </div>
  )
}

export default function NotasPage() {
  return (
    <ResponsavelLayout>
      <Head title="Notas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Notas
          </h1>
          <p className="text-muted-foreground">Acompanhe o desempenho academico dos seus filhos</p>
        </div>

        <NotasContent />
      </div>
    </ResponsavelLayout>
  )
}
