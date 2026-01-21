import type { ReactNode } from 'react'
import { BarChart3, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'

interface ChartContainerProps {
  title: string
  description?: string
  children: ReactNode
  isLoading?: boolean
  error?: Error | null
  className?: string
}

export function ChartContainer({
  title,
  description,
  children,
  isLoading,
  error,
  className,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <BarChart3 className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-sm text-destructive">Erro ao carregar dados</p>
            <p className="text-xs text-muted-foreground">{error.message}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
