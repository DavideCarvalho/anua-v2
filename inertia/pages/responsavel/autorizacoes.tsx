import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { Shield, Clock, History } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { useQuery } from '@tanstack/react-query'

import {
  PendingConsentsContainer,
} from '../../containers/parental-consents/pending-consents-container'
import {
  ConsentHistoryContainer,
} from '../../containers/parental-consents/consent-history-container'
import { usePendingConsentsQueryOptions } from '../../hooks/queries/use_pending_consents'

function PendingCountBadge() {
  const { data } = useQuery(usePendingConsentsQueryOptions())
  const count = data?.length ?? 0

  if (count === 0) return null

  return (
    <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
      {count}
    </Badge>
  )
}

export default function AutorizacoesPage() {
  const [historyPage, setHistoryPage] = useState(1)

  return (
    <ResponsavelLayout>
      <Head title="Autorizações" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Autorizações Parentais
          </h1>
          <p className="text-muted-foreground">
            Autorize a participação dos seus filhos em eventos escolares
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pendentes
              <PendingCountBadge />
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
    </ResponsavelLayout>
  )
}
