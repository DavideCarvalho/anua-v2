import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { ShoppingCart, BarChart3 } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { CanteenPurchasesContainer } from '../../../containers/canteen-purchases-container'
import { CanteenReportsDashboard } from '../../../containers/cantina/canteen-reports-dashboard'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <div className="h-10 w-96 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function VendasPage() {
  const { props } = usePage<PageProps>()
  const canteenId = props.canteenId

  return (
    <EscolaLayout>
      <Head title="Vendas da Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Vendas
          </h1>
          <p className="text-muted-foreground">Historico e relatorios de vendas da cantina</p>
        </div>

        <Tabs defaultValue="historico" className="space-y-4">
          <TabsList>
            <TabsTrigger value="historico" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Historico
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatorios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historico">
            <CanteenPurchasesContainer />
          </TabsContent>

          <TabsContent value="relatorios">
            {canteenId ? (
              <Suspense fallback={<ReportsSkeleton />}>
                <CanteenReportsDashboard canteenId={canteenId} />
              </Suspense>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Cantina nao encontrada no contexto.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </EscolaLayout>
  )
}
