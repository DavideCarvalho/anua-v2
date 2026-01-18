import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Plus, Calendar, UtensilsCrossed } from 'lucide-react'

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

export default function CardapioPage() {
  return (
    <EscolaLayout>
      <Head title="Cardápio" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cardápio</h1>
            <p className="text-muted-foreground">
              Configure o cardápio semanal da cantina
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cardápio
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Semana Atual</CardTitle>
            </div>
            <CardDescription>13/01/2025 - 17/01/2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {diasSemana.map((dia) => (
                <Card key={dia}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{dia}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4 text-muted-foreground">
                      <UtensilsCrossed className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Não definido</p>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </EscolaLayout>
  )
}
