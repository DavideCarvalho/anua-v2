import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  useOwnFinancialQueryOptions,
  useOwnSettlementsQueryOptions,
} from '../hooks/queries/use_store_owner'
import { useUpdateFinancialSettings } from '../hooks/mutations/use_store_owner_mutations'
import { formatCurrency } from '../lib/utils'

const SETTLEMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  PROCESSING: 'Processando',
  TRANSFERRED: 'Transferido',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
}

const SETTLEMENT_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  APPROVED: 'secondary',
  PROCESSING: 'secondary',
  TRANSFERRED: 'default',
  FAILED: 'destructive',
  CANCELLED: 'destructive',
}

const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
]

export function StoreOwnerFinancialContainer() {
  const { data: financialData, isLoading: financialLoading } = useQuery(
    useOwnFinancialQueryOptions()
  )
  const { data: settlementsData, isLoading: settlementsLoading } = useQuery(
    useOwnSettlementsQueryOptions()
  )

  const updateSettings = useUpdateFinancialSettings()
  const settings = financialData as any

  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('CPF')
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  useEffect(() => {
    if (settings) {
      setPixKey(settings.pixKey ?? '')
      setPixKeyType(settings.pixKeyType ?? 'CPF')
      setBankName(settings.bankName ?? '')
      setAccountHolder(settings.accountHolder ?? '')
    }
  }, [settings])

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    updateSettings.mutate({
      pixKey: pixKey || undefined,
      pixKeyType: (pixKeyType || undefined) as any,
      bankName: bankName || undefined,
      accountHolder: accountHolder || undefined,
    } as any)
  }

  const settlements = (settlementsData as any)?.data ?? []

  return (
    <div className="space-y-6">
      {/* PIX/Bank Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Recebimento</CardTitle>
          <CardDescription>
            Configure sua chave PIX e dados bancários para receber os repasses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {financialLoading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
                  <Select value={pixKeyType} onValueChange={setPixKeyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIX_KEY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Titular da Conta</Label>
                  <Input
                    id="accountHolder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Salvando...' : 'Salvar Dados'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Repasses</CardTitle>
          <CardDescription>Histórico de repasses mensais</CardDescription>
        </CardHeader>
        <CardContent>
          {settlementsLoading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
          ) : !settlements.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum repasse registrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Taxa Plataforma</TableHead>
                  <TableHead>Repasse</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      {String(s.month).padStart(2, '0')}/{s.year}
                    </TableCell>
                    <TableCell>{formatCurrency(s.totalSalesAmount)}</TableCell>
                    <TableCell>{formatCurrency(s.commissionAmount)}</TableCell>
                    <TableCell>{formatCurrency(s.platformFeeAmount)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(s.transferAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={SETTLEMENT_STATUS_VARIANTS[s.status] ?? 'outline'}>
                        {SETTLEMENT_STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
