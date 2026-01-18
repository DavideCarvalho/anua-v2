import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'

export default function ConquistasPage() {
  return (
    <EscolaLayout>
      <Head title="Conquistas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conquistas</h1>
          <p className="text-muted-foreground">Badges e conquistas desbloqueadas</p>
        </div>

        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Conquistas (em construção)
          </CardContent>
        </Card>
      </div>
    </EscolaLayout>
  )
}
