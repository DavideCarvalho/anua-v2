import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentOccurrencesContainer } from '../../containers/responsavel/student-occurrences-container'

export default function AlunoOcorrenciasPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Ocorrências" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ocorrências</h1>
          <p className="text-muted-foreground">Seu registro de ocorrências</p>
        </div>
        {user?.studentId ? (
          <StudentOccurrencesContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
