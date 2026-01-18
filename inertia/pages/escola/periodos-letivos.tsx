import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Calendar, Plus, Settings } from 'lucide-react'

export default function PeriodosLetivosPage() {
  return (
    <EscolaLayout>
      <Head title="Períodos Letivos" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Períodos Letivos</h1>
            <p className="text-muted-foreground">
              Gerencie os anos e semestres letivos
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Período
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Atual
                </span>
              </div>
              <CardTitle>2024</CardTitle>
              <CardDescription>Ano Letivo 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início</span>
                  <span>01/02/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Término</span>
                  <span>20/12/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Turmas</span>
                  <span>15</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">2023</CardTitle>
              <CardDescription>Ano Letivo 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início</span>
                  <span>01/02/2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Término</span>
                  <span>20/12/2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Turmas</span>
                  <span>12</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-4">
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </EscolaLayout>
  )
}
