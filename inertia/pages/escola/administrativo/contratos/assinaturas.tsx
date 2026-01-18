import { Head, usePage } from '@inertiajs/react'

import { EscolaLayout } from '../../../../components/layouts'
import { SignatureStatusTable } from '../../../../containers/contracts/signature-status-table'

export default function AssinaturasContratoPage() {
  const { props } = usePage<{ contractId?: string }>()
  const contractId = props.contractId

  return (
    <EscolaLayout>
      <Head title="Status de Assinaturas" />

      <div className="container mx-auto py-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold">Status de Assinaturas</h1>
          <p className="text-muted-foreground">
            Acompanhe quem já assinou o contrato digital e quem está pendente
          </p>
        </div>

        {contractId ? (
          <SignatureStatusTable contractId={contractId} />
        ) : (
          <div className="text-sm text-muted-foreground">Contrato não informado.</div>
        )}
      </div>
    </EscolaLayout>
  )
}
