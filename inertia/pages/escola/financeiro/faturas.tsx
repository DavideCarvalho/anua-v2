import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { InvoicesContainer } from '../../../containers/invoices-container'

export default function FaturasPage() {
  return (
    <EscolaLayout>
      <Head title="Faturas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faturas</h1>
          <p className="text-muted-foreground">
            Gerencie as faturas dos alunos da escola
          </p>
        </div>

        <InvoicesContainer />
      </div>
    </EscolaLayout>
  )
}
