import { Head } from '@inertiajs/react'
import { Settings } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { InfoIcon } from 'lucide-react'

export default function AdminConfiguracaoPage() {
  return (
    <AdminLayout>
      <Head title="Configuração - Seguros - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuração de Seguros
          </h1>
          <p className="text-muted-foreground">
            Configure o seguro educacional para redes e escolas
          </p>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Hierarquia de Configuração</AlertTitle>
          <AlertDescription>
            As configurações de seguro seguem uma hierarquia: Rede → Escola → Contrato.
            Cada nível pode herdar ou sobrescrever as configurações do nível superior.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Rede</CardTitle>
              <CardDescription>
                Defina as configurações padrão de seguro para todas as escolas de uma rede
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Para configurar o seguro de uma rede, acesse a página de redes em{' '}
                <span className="font-medium">Admin → Redes</span> e edite a rede desejada.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Escola</CardTitle>
              <CardDescription>
                Sobrescreva as configurações da rede para escolas específicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Para configurar o seguro de uma escola específica, acesse a página de escolas em{' '}
                <span className="font-medium">Admin → Escolas</span> e edite a escola desejada.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Seguro</CardTitle>
            <CardDescription>Entenda os parâmetros configuráveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Taxa do Seguro (%)</h4>
              <p className="text-sm text-muted-foreground">
                Percentual cobrado sobre o valor das mensalidades. Mínimo de 3%.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Cobertura (%)</h4>
              <p className="text-sm text-muted-foreground">
                Percentual do valor em atraso que será coberto pelo seguro (50%, 70% ou 100%).
              </p>
            </div>
            <div>
              <h4 className="font-medium">Dias de Carência</h4>
              <p className="text-sm text-muted-foreground">
                Número de dias que um pagamento deve estar em atraso antes de gerar um sinistro.
                O padrão é 90 dias.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
