import { Head, usePage } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { EscolaLayout } from '../../../components/layouts'
import { CanteenGate } from '../../../components/cantina/canteen-gate'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { MonthlyTransfersTable } from '../../../containers/cantina/monthly-transfers-table'
import type { SharedProps } from '../../../lib/types'
import { api } from '~/lib/api'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

function FinancialSettingsCard({ canteenId }: { canteenId: string }) {
  const queryClient = useQueryClient()
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [platformFeePercentage, setPlatformFeePercentage] = useState('0')

  const queryOptions = useMemo(
    () => api.api.v1.canteens.financialSettings.show.queryOptions({ params: { canteenId } }),
    [canteenId]
  )

  const { data: financialSettings, isLoading } = useQuery(queryOptions)

  useEffect(() => {
    if (!financialSettings) return

    setPixKey(financialSettings.pixKey ?? '')
    setPixKeyType(financialSettings.pixKeyType ?? '')
    setBankName(financialSettings.bankName ?? '')
    setAccountHolder(financialSettings.accountHolder ?? '')
    setPlatformFeePercentage(String(financialSettings.platformFeePercentage ?? 0))
  }, [financialSettings])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/canteens/${canteenId}/financial-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pixKey: pixKey.trim() || null,
          pixKeyType: pixKeyType || null,
          bankName: bankName.trim() || null,
          accountHolder: accountHolder.trim() || null,
          platformFeePercentage: Number(platformFeePercentage) || 0,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message || 'Não foi possível salvar as configurações financeiras')
      }

      return response.json()
    },
    onSuccess: async () => {
      toast.success('Configuração financeira salva com sucesso')
      await queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar configuração financeira')
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração financeira da cantina</CardTitle>
        <CardDescription>
          Defina a chave PIX de recebimento e a taxa da plataforma usada no repasse.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="canteen-pix-key">Chave PIX</Label>
            <Input
              id="canteen-pix-key"
              value={pixKey}
              onChange={(event) => setPixKey(event.target.value)}
              placeholder="contato@cantina.com.br"
              disabled={isLoading || saveMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canteen-pix-key-type">Tipo da chave PIX</Label>
            <select
              id="canteen-pix-key-type"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={pixKeyType}
              onChange={(event) => setPixKeyType(event.target.value)}
              disabled={isLoading || saveMutation.isPending}
            >
              <option value="">Selecione</option>
              <option value="EMAIL">Email</option>
              <option value="PHONE">Telefone</option>
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="RANDOM">Aleatória</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canteen-bank-name">Banco</Label>
            <Input
              id="canteen-bank-name"
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
              placeholder="Banco responsável pelo recebimento"
              disabled={isLoading || saveMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canteen-account-holder">Titular da conta</Label>
            <Input
              id="canteen-account-holder"
              value={accountHolder}
              onChange={(event) => setAccountHolder(event.target.value)}
              placeholder="Nome do titular"
              disabled={isLoading || saveMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canteen-platform-fee">Taxa da plataforma (%)</Label>
            <Input
              id="canteen-platform-fee"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={platformFeePercentage}
              onChange={(event) => setPlatformFeePercentage(event.target.value)}
              disabled={isLoading || saveMutation.isPending}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={isLoading || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar configuração financeira'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CantinaTransferenciasPage() {
  const { props } = usePage<PageProps>()
  const canteenId = props.canteenId

  return (
    <EscolaLayout>
      <Head title="Transferências Mensais" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Transferências Mensais
          </h1>
          <p className="text-muted-foreground">Gerencie as transferências mensais da cantina</p>
        </div>

        <CanteenGate>
          {canteenId ? <FinancialSettingsCard canteenId={canteenId} /> : null}
          <MonthlyTransfersTable canteenId={canteenId ?? undefined} />
        </CanteenGate>
      </div>
    </EscolaLayout>
  )
}
