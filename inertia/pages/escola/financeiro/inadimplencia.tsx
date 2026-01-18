import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StudentPaymentsContainer } from '../../../containers/student-payments-container'

export default function InadimplenciaPage() {
  return (
    <EscolaLayout>
      <Head title="Inadimplência" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inadimplência</h1>
          <p className="text-muted-foreground">Acompanhe alunos e pagamentos em atraso</p>
        </div>

        <StudentPaymentsContainer status="OVERDUE" showSearch={false} />
      </div>
    </EscolaLayout>
  )
}
