import { useEffect, useState } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion'
import { useAsaasPaymentConfigQueryOptions } from '../../../hooks/queries/use_asaas_payment_config'
import type { AsaasPaymentConfigResponse } from '../../../hooks/queries/use_asaas_payment_config'
import { AsaasOnboardingWizard } from '../../../containers/asaas/asaas-onboarding-wizard'
import { useSchoolQueryOptions } from '../../../hooks/queries/use_school'
import { useUpdateSchool } from '../../../hooks/mutations/use_school_mutations'
import type { SharedProps } from '../../../lib/types'

type NfseFormData = {
  nfseEnabled: boolean
  nfseMunicipalServiceCode: string
  nfseMunicipalServiceName: string
  nfseIssPercentage: string
  nfseCofinsPercentage: string
  nfsePisPercentage: string
  nfseCsllPercentage: string
  nfseInssPercentage: string
  nfseIrPercentage: string
  nfseDeductions: string
}

type SchoolNfseData = {
  nfseEnabled?: boolean | null
  nfseMunicipalServiceCode?: string | null
  nfseMunicipalServiceName?: string | null
  nfseIssPercentage?: number | null
  nfseCofinsPercentage?: number | null
  nfsePisPercentage?: number | null
  nfseCsllPercentage?: number | null
  nfseInssPercentage?: number | null
  nfseIrPercentage?: number | null
  nfseDeductions?: number | null
}

const EMPTY_NFSE_FORM: NfseFormData = {
  nfseEnabled: false,
  nfseMunicipalServiceCode: '',
  nfseMunicipalServiceName: '',
  nfseIssPercentage: '',
  nfseCofinsPercentage: '',
  nfsePisPercentage: '',
  nfseCsllPercentage: '',
  nfseInssPercentage: '',
  nfseIrPercentage: '',
  nfseDeductions: '',
}

function numberOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

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
  const { props } = usePage<SharedProps>()
  const schoolId = props.selectedSchoolIds?.[0] ?? props.user?.schoolId ?? null
  const [wizardOpen, setWizardOpen] = useState(false)
  const [fiscalData, setFiscalData] = useState<NfseFormData>(EMPTY_NFSE_FORM)
  const { data, isLoading } = useQuery(useAsaasPaymentConfigQueryOptions())
  const { data: schoolData, isLoading: isLoadingSchool } = useQuery({
    ...useSchoolQueryOptions(schoolId ?? ''),
    enabled: !!schoolId,
  })
  const updateSchool = useUpdateSchool()
  const hasAsaasAccount = Boolean(data?.hasAsaasAccount)
  const accountActionLabel = hasAsaasAccount ? 'Atualizar dados da conta' : 'Configurar Conta'
  const accountActionVariant = hasAsaasAccount ? 'outline' : 'default'

  useEffect(() => {
    if (!schoolData) return
    const school = schoolData as SchoolNfseData
    setFiscalData({
      nfseEnabled: Boolean(school.nfseEnabled),
      nfseMunicipalServiceCode: school.nfseMunicipalServiceCode ?? '',
      nfseMunicipalServiceName: school.nfseMunicipalServiceName ?? '',
      nfseIssPercentage:
        school.nfseIssPercentage === null || school.nfseIssPercentage === undefined
          ? ''
          : String(school.nfseIssPercentage),
      nfseCofinsPercentage:
        school.nfseCofinsPercentage === null || school.nfseCofinsPercentage === undefined
          ? ''
          : String(school.nfseCofinsPercentage),
      nfsePisPercentage:
        school.nfsePisPercentage === null || school.nfsePisPercentage === undefined
          ? ''
          : String(school.nfsePisPercentage),
      nfseCsllPercentage:
        school.nfseCsllPercentage === null || school.nfseCsllPercentage === undefined
          ? ''
          : String(school.nfseCsllPercentage),
      nfseInssPercentage:
        school.nfseInssPercentage === null || school.nfseInssPercentage === undefined
          ? ''
          : String(school.nfseInssPercentage),
      nfseIrPercentage:
        school.nfseIrPercentage === null || school.nfseIrPercentage === undefined
          ? ''
          : String(school.nfseIrPercentage),
      nfseDeductions:
        school.nfseDeductions === null || school.nfseDeductions === undefined
          ? ''
          : String(school.nfseDeductions),
    })
  }, [schoolData])

  const handleFiscalChange = (field: keyof NfseFormData, value: string | boolean) => {
    setFiscalData((prev) => ({ ...prev, [field]: value }))
  }

  const applySimpleNationalPreset = () => {
    setFiscalData((prev) => ({
      ...prev,
      nfseCofinsPercentage: '0',
      nfsePisPercentage: '0',
      nfseCsllPercentage: '0',
      nfseInssPercentage: '0',
      nfseIrPercentage: '0',
      nfseDeductions: '0',
    }))
  }

  const handleSaveFiscalConfig = async () => {
    if (!schoolId) {
      toast.error('Escola não encontrada no contexto')
      return
    }

    await updateSchool.mutateAsync({
      id: schoolId,
      nfseEnabled: fiscalData.nfseEnabled,
      nfseMunicipalServiceCode: fiscalData.nfseMunicipalServiceCode.trim() || null,
      nfseMunicipalServiceName: fiscalData.nfseMunicipalServiceName.trim() || null,
      nfseIssPercentage: numberOrNull(fiscalData.nfseIssPercentage),
      nfseCofinsPercentage: numberOrNull(fiscalData.nfseCofinsPercentage),
      nfsePisPercentage: numberOrNull(fiscalData.nfsePisPercentage),
      nfseCsllPercentage: numberOrNull(fiscalData.nfseCsllPercentage),
      nfseInssPercentage: numberOrNull(fiscalData.nfseInssPercentage),
      nfseIrPercentage: numberOrNull(fiscalData.nfseIrPercentage),
      nfseDeductions: numberOrNull(fiscalData.nfseDeductions),
    })

    toast.success('Configuração fiscal salva com sucesso')
  }

  const status = data?.paymentConfigStatus ?? 'NOT_CONFIGURED'
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <EscolaLayout>
      <Head title="Configuracao de Pagamentos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuracao de Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie a integracao de pagamentos da sua escola</p>
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
              <Button variant={accountActionVariant} onClick={() => setWizardOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                {accountActionLabel}
              </Button>

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

        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Configuração Fiscal (NFS-e)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Defina os dados fiscais usados na emissão da NFS-e das faturas.
            </p>
          </div>

          {isLoadingSchool ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando dados fiscais...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="nfseEnabled">Habilitar emissão de NFS-e</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quando desabilitado, as faturas não tentam emitir nota fiscal.
                  </p>
                </div>
                <Switch
                  id="nfseEnabled"
                  checked={fiscalData.nfseEnabled}
                  onCheckedChange={(checked) => handleFiscalChange('nfseEnabled', checked)}
                />
              </div>

              {fiscalData.nfseEnabled ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nfseMunicipalServiceCode">Código do serviço municipal</Label>
                      <Input
                        id="nfseMunicipalServiceCode"
                        value={fiscalData.nfseMunicipalServiceCode}
                        onChange={(e) =>
                          handleFiscalChange('nfseMunicipalServiceCode', e.target.value)
                        }
                        placeholder="Ex.: 12.34"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="nfseMunicipalServiceName">
                        Descrição do serviço municipal
                      </Label>
                      <Input
                        id="nfseMunicipalServiceName"
                        value={fiscalData.nfseMunicipalServiceName}
                        onChange={(e) =>
                          handleFiscalChange('nfseMunicipalServiceName', e.target.value)
                        }
                        placeholder="Ex.: Serviços educacionais"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nfseIssPercentage">ISS (%)</Label>
                      <Input
                        id="nfseIssPercentage"
                        value={fiscalData.nfseIssPercentage}
                        onChange={(e) => handleFiscalChange('nfseIssPercentage', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border bg-muted/40 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Regra comum para escolas no Simples: retenções federais zeradas.
                    </p>
                    <Button type="button" variant="outline" onClick={applySimpleNationalPreset}>
                      Aplicar preset Simples Nacional
                    </Button>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-taxes" className="border rounded-md px-4">
                      <AccordionTrigger>
                        Tributos avançados (PIS/COFINS/CSLL/INSS/IR)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="nfseCofinsPercentage">COFINS (%)</Label>
                            <Input
                              id="nfseCofinsPercentage"
                              value={fiscalData.nfseCofinsPercentage}
                              onChange={(e) =>
                                handleFiscalChange('nfseCofinsPercentage', e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nfsePisPercentage">PIS (%)</Label>
                            <Input
                              id="nfsePisPercentage"
                              value={fiscalData.nfsePisPercentage}
                              onChange={(e) =>
                                handleFiscalChange('nfsePisPercentage', e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nfseCsllPercentage">CSLL (%)</Label>
                            <Input
                              id="nfseCsllPercentage"
                              value={fiscalData.nfseCsllPercentage}
                              onChange={(e) =>
                                handleFiscalChange('nfseCsllPercentage', e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nfseInssPercentage">INSS (%)</Label>
                            <Input
                              id="nfseInssPercentage"
                              value={fiscalData.nfseInssPercentage}
                              onChange={(e) =>
                                handleFiscalChange('nfseInssPercentage', e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nfseIrPercentage">IR (%)</Label>
                            <Input
                              id="nfseIrPercentage"
                              value={fiscalData.nfseIrPercentage}
                              onChange={(e) =>
                                handleFiscalChange('nfseIrPercentage', e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nfseDeductions">Deduções (centavos)</Label>
                            <Input
                              id="nfseDeductions"
                              value={fiscalData.nfseDeductions}
                              onChange={(e) => handleFiscalChange('nfseDeductions', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Ative a emissão de NFS-e para preencher os dados fiscais.
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveFiscalConfig}
                  disabled={updateSchool.isPending || !schoolId}
                >
                  {updateSchool.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar configuração fiscal'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <AsaasOnboardingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        documentUrl={data?.documentUrl}
        paymentConfigStatus={data?.paymentConfigStatus}
        hasAsaasAccount={Boolean(data?.hasAsaasAccount)}
      />
    </EscolaLayout>
  )
}
