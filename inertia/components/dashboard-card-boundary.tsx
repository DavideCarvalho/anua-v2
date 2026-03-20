import { type QueryKey, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { type ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

interface DashboardCardBoundaryProps {
  title: string
  queryKeys?: QueryKey[]
  children: ReactNode
}

function DashboardCardErrorFallback({
  title,
  queryKeys,
  resetErrorBoundary,
}: {
  title: string
  queryKeys?: QueryKey[]
  resetErrorBoundary: () => void
}) {
  const queryClient = useQueryClient()

  const handleRetry = async () => {
    if (queryKeys && queryKeys.length > 0) {
      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey, refetchType: 'active' })
        )
      )
    }
    resetErrorBoundary()
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Não foi possível carregar este card</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span>Tente novamente para recarregar este card.</span>
          <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
            Recarregar card
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardCardBoundary({ title, queryKeys, children }: DashboardCardBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <DashboardCardErrorFallback
          title={title}
          queryKeys={queryKeys}
          resetErrorBoundary={resetErrorBoundary}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
