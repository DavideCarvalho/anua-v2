import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'

export default function RecompensasPage() {
  return (
    <EscolaLayout>
      <Head title="Recompensas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recompensas</h1>
          <p className="text-muted-foreground">Loja de recompensas e resgates</p>
        </div>

        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Recompensas (em construção)
          </CardContent>
        </Card>
      </div>
    </EscolaLayout>
  )
}
