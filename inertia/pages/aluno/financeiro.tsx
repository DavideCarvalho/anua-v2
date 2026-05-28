import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentPaymentsContainer } from '../../containers/responsavel/student-payments-container'

export default function AlunoFinanceiroPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Financeiro" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Suas mensalidades e faturas</p>
        </div>
        {user?.studentId ? (
          <StudentPaymentsContainer studentId={user.studentId} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
