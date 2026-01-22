import { Link } from '@tuyau/inertia/react'
import { ArrowLeft, Edit, Calendar } from 'lucide-react'
import { differenceInDays, isBefore } from 'date-fns'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

interface PeriodoLetivoHeaderProps {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  isClosed: boolean
}

export function PeriodoLetivoHeader({
  id,
  name,
  startDate,
  endDate,
  isActive,
  isClosed,
}: PeriodoLetivoHeaderProps) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  const isBeforeStart = isBefore(now, start)
  const daysUntilEnd = differenceInDays(end, now)

  const getStatus = () => {
    if (isClosed) return { label: 'Encerrado', variant: 'secondary' as const }
    if (isBeforeStart) return { label: 'Não iniciado', variant: 'outline' as const }
    if (isActive) return { label: 'Em andamento', variant: 'default' as const }
    return { label: 'Finalizado', variant: 'secondary' as const }
  }

  const status = getStatus()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link route="web.escola.periodosLetivos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {!isClosed && !isBeforeStart && daysUntilEnd > 0 && (
              <p className="text-sm text-muted-foreground">
                {daysUntilEnd} dias restantes
              </p>
            )}
          </div>
        </div>
      </div>
      <Link route="web.escola.administrativo.periodosLetivos.editar" params={{ id }}>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </Link>
    </div>
  )
}
