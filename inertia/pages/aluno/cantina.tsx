import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentBalanceContainer } from '../../containers/responsavel/student-balance-container'
import { StudentCanteenPurchasesContainer } from '../../containers/responsavel/student-canteen-purchases-container'
import { MealRecurrenceConfig } from '../../containers/responsavel/meal-recurrence-config'

export default function AlunoCantinaPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Cantina" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cantina</h1>
          <p className="text-muted-foreground">Seu saldo e consumo na cantina</p>
        </div>
        {user?.studentId ? (
          <StudentBalanceContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
        {user?.studentId ? (
          <StudentCanteenPurchasesContainer studentId={user.studentId} />
        ) : null}
        {user?.studentId ? (
          <MealRecurrenceConfig studentId={user.studentId} />
        ) : null}
      </div>
    </AlunoLayout>
  )
}
