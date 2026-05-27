import { Head, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import type { Template } from '@pdfme/common'

import { EscolaLayout } from '../../../../components/layouts'
import { SignatureTemplateBuilder } from '../../../../containers/contracts/signature-template-builder'

export default function ContratoAssinaturaPage() {
  const { props } = usePage<{ contractId?: string }>()
  const contractId = props.contractId

  function handleSave(template: Template) {
    toast.success('Template salvo com sucesso')
    console.log('Template saved:', JSON.stringify(template.schemas, null, 2))
  }

  return (
    <EscolaLayout>
      <Head title="Configurar Assinatura Digital" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurar Assinatura Digital</h1>
          <p className="text-muted-foreground">
            Faça upload do contrato e posicione os campos de assinatura
          </p>
        </div>

        {contractId ? (
          <SignatureTemplateBuilder contractId={contractId} onSave={handleSave} />
        ) : (
          <SignatureTemplateBuilder contractId="test" onSave={handleSave} />
        )}
      </div>
    </EscolaLayout>
  )
}
