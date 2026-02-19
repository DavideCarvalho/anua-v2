import { Head } from '@inertiajs/react'
import { BookOpen } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentGradesContainer,
  StudentGradesContainerSkeleton,
} from '../../containers/responsavel/student-grades-container'

function NotasContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <StudentGradesContainerSkeleton />
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não possui alunos vinculados à sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <StudentGradesContainer studentId={student.id} studentName={student.name} />
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
