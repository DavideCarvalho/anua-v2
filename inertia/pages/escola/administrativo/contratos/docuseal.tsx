import { Head, usePage } from '@inertiajs/react'

import { EscolaLayout } from '../../../../components/layouts'
import { DocusealTemplateBuilder } from '../../../../containers/contracts/docuseal-template-builder'

export default function DocusealContratoPage() {
  const { props } = usePage<{ contractId?: string }>()
  const contractId = props.contractId

  return (
    <EscolaLayout>
      <Head title="Configurar Assinatura Digital" />

      <div className="container mx-auto py-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold">Configurar Assinatura Digital</h1>
          <p className="text-muted-foreground">
            Faça upload de um PDF e configure os campos de assinatura para a matrícula online
          </p>
        </div>

        {contractId ? (
          <DocusealTemplateBuilder contractId={contractId} />
        ) : (
          <div className="text-sm text-muted-foreground">Contrato não informado.</div>
        )}
      </div>
    </EscolaLayout>
  )
}
