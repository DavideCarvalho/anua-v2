import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/lib/api'

interface StoreFinancialSettingsTabProps {
  storeId: string
}

export function StoreFinancialSettingsTab({ storeId }: StoreFinancialSettingsTabProps) {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery(
    api.api.v1.stores.financialSettings.show.queryOptions({ params: { storeId } })
  )

  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState<'' | 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'>(
    ''
  )
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  useEffect(() => {
    if (settings) {
      setPixKey(settings.pixKey ?? '')
      setPixKeyType(settings.pixKeyType ?? '')
      setBankName(settings.bankName ?? '')
      setAccountHolder(settings.accountHolder ?? '')
    }
  }, [settings])

  const mutation = useMutation(api.api.v1.stores.financialSettings.upsert.mutationOptions())

  const pixKeyTypeLabels: Record<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM', string> = {
    CPF: 'CPF',
    CNPJ: 'CNPJ',
    EMAIL: 'E-mail',
    PHONE: 'Telefone',
    RANDOM: 'Aleatória',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutation.mutateAsync({
        params: { storeId },
        body: {
          pixKey: pixKey || undefined,
          pixKeyType: pixKeyType || undefined,
          bankName: bankName || undefined,
          accountHolder: accountHolder || undefined,
        },
      })
      queryClient.invalidateQueries({
        queryKey: api.api.v1.stores.financialSettings.show.pathKey(),
      })
      toast.success('Configurações salvas com sucesso!')
    } catch {
      toast.error('Erro ao salvar configurações.')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>Dados bancários para repasse.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Chave PIX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKeyType">Tipo da Chave</Label>
            <Select
              value={pixKeyType}
              onValueChange={(value) => {
                if (
                  value === '' ||
                  value === 'CPF' ||
                  value === 'CNPJ' ||
                  value === 'EMAIL' ||
                  value === 'PHONE' ||
                  value === 'RANDOM'
                ) {
                  setPixKeyType(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue>{pixKeyType ? pixKeyTypeLabels[pixKeyType] : 'Selecione'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="EMAIL">E-mail</SelectItem>
                <SelectItem value="PHONE">Telefone</SelectItem>
                <SelectItem value="RANDOM">Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Banco</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Nome do banco"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Titular</Label>
            <Input
              id="accountHolder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Nome do titular"
            />
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
