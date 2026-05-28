import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentAssignmentsContainer } from '../../containers/responsavel/student-assignments-container'

export default function AlunoAtividadesPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Atividades" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground">Suas atividades e tarefas</p>
        </div>
        {user?.studentId ? (
          <StudentAssignmentsContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
