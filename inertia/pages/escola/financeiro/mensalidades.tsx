import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StudentPaymentsContainer } from '../../../containers/student-payments-container'

export default function MensalidadesPage() {
  return (
    <EscolaLayout>
      <Head title="Mensalidades" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mensalidades</h1>
          <p className="text-muted-foreground">
            Gerencie as mensalidades e pagamentos dos alunos
          </p>
        </div>

        <StudentPaymentsContainer />
      </div>
    </EscolaLayout>
  )
}
