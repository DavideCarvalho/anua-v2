import { Head } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { Building, Users } from 'lucide-react'

import { AdminLayout } from '../../components/layouts'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { SchoolChainsTable } from '../../containers/admin/school-chains-table'
import { SchoolGroupsTable } from '../../containers/admin/school-groups-table'

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

export default function AdminRedesPage() {
  const [activeTab, setActiveTab] = useState('chains')

  return (
    <AdminLayout>
      <Head title="Redes e Grupos - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6" />
            Redes e Grupos
          </h1>
          <p className="text-muted-foreground">
            Gerencie redes de escolas e grupos organizacionais
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="chains" className="gap-2">
              <Building className="h-4 w-4" />
              Redes
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chains" className="mt-6">
            <Suspense fallback={<TableSkeleton />}>
              <SchoolChainsTable />
            </Suspense>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <Suspense fallback={<TableSkeleton />}>
              <SchoolGroupsTable />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
