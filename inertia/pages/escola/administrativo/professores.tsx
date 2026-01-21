import { Head } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { GraduationCap, Calendar, Users } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { TeachersListContainer } from '../../../containers/teachers-list-container'
import { TeacherAbsencesTable } from '../../../containers/teachers/teacher-absences-table'

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

export default function ProfessoresPage() {
  const [activeTab, setActiveTab] = useState('lista')

  return (
    <EscolaLayout>
      <Head title="Professores" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Professores
          </h1>
          <p className="text-muted-foreground">
            Gerencie o corpo docente da escola
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="lista" className="gap-2">
              <Users className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="ausencias" className="gap-2">
              <Calendar className="h-4 w-4" />
              Ausências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="mt-6">
            <TeachersListContainer />
          </TabsContent>

          <TabsContent value="ausencias" className="mt-6">
            <Suspense fallback={<TableSkeleton />}>
              <TeacherAbsencesTable />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </EscolaLayout>
  )
}
