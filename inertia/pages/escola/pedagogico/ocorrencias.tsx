import { Head } from '@inertiajs/react'
import { AlertTriangle, Construction } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'

export default function OcorrenciasPage() {
  return (
    <EscolaLayout>
      <Head title="Ocorrencias" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Ocorrencias
          </h1>
          <p className="text-muted-foreground">
            Registre e acompanhe ocorrencias disciplinares
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
            <CardTitle>Funcionalidade em Desenvolvimento</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              O modulo de ocorrencias disciplinares esta sendo desenvolvido. Em breve voce podera
              registrar, acompanhar e gerenciar ocorrencias dos alunos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto mt-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium">Registro de Ocorrencias</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Cadastre ocorrencias disciplinares
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium">Acompanhamento</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Acompanhe o historico dos alunos
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium">Notificacoes</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Comunique responsaveis automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EscolaLayout>
  )
}
