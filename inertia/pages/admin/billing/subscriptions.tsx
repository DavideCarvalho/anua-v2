import { Head } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { CreditCard, Package } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { SubscriptionsTable } from '../../../containers/admin/subscriptions-table'
import { SubscriptionPlansTable } from '../../../containers/admin/subscription-plans-table'

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('subscriptions')

  return (
    <AdminLayout>
      <Head title="Assinaturas - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Gestão de Assinaturas
          </h1>
          <p className="text-muted-foreground">
            Gerencie planos, assinaturas e faturas das escolas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="subscriptions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Package className="h-4 w-4" />
              Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="mt-6">
            <Suspense fallback={<TableSkeleton />}>
              <SubscriptionsTable />
            </Suspense>
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <Suspense fallback={<TableSkeleton />}>
              <SubscriptionPlansTable />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
