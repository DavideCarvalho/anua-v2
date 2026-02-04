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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface StoreFinancialSettingsTabProps {
  storeId: string
}

async function fetchSettings(storeId: string) {
  const response = await fetch(`/api/v1/stores/${storeId}/financial-settings`, {
    credentials: 'include',
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Failed to fetch settings')
  return response.json()
}

async function upsertSettings(storeId: string, data: Record<string, unknown>) {
  const response = await fetch(`/api/v1/stores/${storeId}/financial-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to save settings')
  return response.json()
}

export function StoreFinancialSettingsTab({ storeId }: StoreFinancialSettingsTabProps) {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['storeFinancialSettings', storeId],
    queryFn: () => fetchSettings(storeId),
  })

  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('')
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

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => upsertSettings(storeId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['storeFinancialSettings', storeId] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      pixKey: pixKey || undefined,
      pixKeyType: pixKeyType || undefined,
      bankName: bankName || undefined,
      accountHolder: accountHolder || undefined,
    })
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>
          Dados bancários para repasse.
        </CardDescription>
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
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="EMAIL">E-mail</SelectItem>
                <SelectItem value="PHONE">Telefone</SelectItem>
                <SelectItem value="RANDOM">Aleatoria</SelectItem>
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

          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Salvo com sucesso</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
