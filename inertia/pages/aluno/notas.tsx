import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentGradesContainer } from '../../containers/responsavel/student-grades-container'

export default function AlunoNotasPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Notas" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">Suas notas e avaliações</p>
        </div>
        {user?.studentId ? (
          <StudentGradesContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
