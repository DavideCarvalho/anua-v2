import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { Clock, History } from 'lucide-react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { PendingConsentsContainer } from '../../containers/parental-consents/pending-consents-container'
import { ConsentHistoryContainer } from '../../containers/parental-consents/consent-history-container'

export default function AlunoAutorizacoesPage() {
  const [historyPage, setHistoryPage] = useState(1)
  return (
    <AlunoLayout>
      <Head title="Autorizações" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Autorizações</h1>
          <p className="text-muted-foreground">Autorize sua participação em eventos escolares</p>
        </div>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
            <PendingConsentsContainer />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <ConsentHistoryContainer page={historyPage} onPageChange={setHistoryPage} />
          </TabsContent>
        </Tabs>
      </div>
    </AlunoLayout>
  )
}
