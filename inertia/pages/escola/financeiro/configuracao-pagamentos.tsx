import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Settings,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { useAsaasPaymentConfigQueryOptions } from '../../../hooks/queries/use_asaas_payment_config'
import type { AsaasPaymentConfigResponse } from '../../../hooks/queries/use_asaas_payment_config'
import { AsaasOnboardingWizard } from '../../../containers/asaas/asaas-onboarding-wizard'

const statusConfig: Record<
  AsaasPaymentConfigResponse['paymentConfigStatus'],
  {
    label: string
    description: string
    variant: 'default' | 'warning' | 'success' | 'destructive'
    icon: React.ElementType
  }
> = {
  NOT_CONFIGURED: {
    label: 'Nao Configurado',
    description: 'Configure sua conta de pagamento para comecar a receber mensalidades.',
    variant: 'default',
    icon: Settings,
  },
  PENDING_DOCUMENTS: {
    label: 'Documentos Pendentes',
    description:
      'Sua conta foi criada. Envie os documentos necessarios para ativar o recebimento de pagamentos.',
    variant: 'warning',
    icon: Clock,
  },
  PENDING_APPROVAL: {
    label: 'Em Analise',
    description:
      'Seus documentos foram enviados e estao sendo analisados. Esse processo leva em media 1-2 dias uteis.',
    variant: 'warning',
    icon: Clock,
  },
  ACTIVE: {
    label: 'Ativo',
    description: 'Sua conta esta ativa e pronta para receber pagamentos.',
    variant: 'success',
    icon: CheckCircle2,
  },
  EXPIRING_SOON: {
    label: 'Dados Expirando',
    description:
      'Seus dados comerciais estao prestes a expirar. Atualize-os para manter o recebimento ativo.',
    variant: 'warning',
    icon: AlertTriangle,
  },
  EXPIRED: {
    label: 'Dados Expirados',
    description:
      'Seus dados comerciais expiraram. Atualize-os imediatamente para restaurar o recebimento de pagamentos.',
    variant: 'destructive',
    icon: XCircle,
  },
  REJECTED: {
    label: 'Rejeitado',
    description: 'Sua conta foi rejeitada. Entre em contato com o suporte para mais informacoes.',
    variant: 'destructive',
    icon: XCircle,
  },
}

const badgeColors = {
  default: 'bg-muted text-muted-foreground',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
}

export default function ConfiguracaoPagamentosPage() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const { data, isLoading } = useQuery(useAsaasPaymentConfigQueryOptions())

  const status = data?.paymentConfigStatus ?? 'NOT_CONFIGURED'
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <EscolaLayout>
      <Head title="Configuracao de Pagamentos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuracao de Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie a integracao de pagamentos da sua escola
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6 space-y-6">
            {/* Status badge */}
            <div className="flex items-center gap-3">
              <StatusIcon className="h-6 w-6" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Status da Conta</h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[config.variant]}`}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
              </div>
            </div>

            {/* Actions based on status */}
            <div className="flex gap-3">
              {!data?.hasAsaasAccount && (
                <Button onClick={() => setWizardOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Conta
                </Button>
              )}

              {(status === 'PENDING_DOCUMENTS' || status === 'PENDING_APPROVAL') &&
                data?.documentUrl && (
                  <Button asChild variant="outline">
                    <a href={data.documentUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Enviar Documentos
                    </a>
                  </Button>
                )}

              {status === 'PENDING_DOCUMENTS' && !data?.documentUrl && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando link para envio de documentos...
                </div>
              )}

              {status === 'ACTIVE' && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Pagamentos ativos e funcionando
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AsaasOnboardingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        documentUrl={data?.documentUrl}
        paymentConfigStatus={data?.paymentConfigStatus}
      />
    </EscolaLayout>
  )
}
