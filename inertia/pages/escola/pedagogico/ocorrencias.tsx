import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Search, Plus, AlertTriangle } from 'lucide-react'

export default function OcorrenciasPage() {
  return (
    <EscolaLayout>
      <Head title="Ocorrências" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ocorrências</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe ocorrências disciplinares
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar ocorrências..." className="pl-9" />
          </div>
          <Button className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma ocorrência registrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              As ocorrências disciplinares aparecerão aqui
            </p>
          </CardContent>
        </Card>
      </div>
    </EscolaLayout>
  )
}
