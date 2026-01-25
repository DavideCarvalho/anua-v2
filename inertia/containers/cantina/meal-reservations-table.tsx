import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar, User, Check, X, Clock, Utensils } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useCanteenMealReservationsQueryOptions } from '../../hooks/queries/use_canteen_meal_reservations'
import {
  useUpdateCanteenMealReservationStatus,
  useCancelCanteenMealReservation,
} from '../../hooks/mutations/use_canteen_reservation_mutations'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

interface MealReservationsTableProps {
  canteenId?: string
  date?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: { label: 'Pendente', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmada', variant: 'default' },
  DELIVERED: { label: 'Entregue', variant: 'outline' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
  NO_SHOW: { label: 'Não Compareceu', variant: 'destructive' },
}

export function MealReservationsTable({ canteenId, date }: MealReservationsTableProps) {
  const { data } = useSuspenseQuery(
    useCanteenMealReservationsQueryOptions({ canteenId, date })
  )
  const updateStatusMutation = useUpdateCanteenMealReservationStatus()
  const cancelMutation = useCancelCanteenMealReservation()

  const reservations = Array.isArray(data) ? data : data?.data || []

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma reserva encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            As reservas de refeições aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservas de Refeições</CardTitle>
        <CardDescription>{reservations.length} reserva(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Refeição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation: any) => {
              const config = statusConfig[reservation.status] || statusConfig.PENDING

              return (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {reservation.student?.name || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      {reservation.meal?.name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.date
                      ? format(new Date(reservation.date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {reservation.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: reservation.id,
                                status: 'CONFIRMED',
                              })
                            }
                            title="Confirmar"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelMutation.mutate(reservation.id)}
                            title="Cancelar"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {reservation.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: reservation.id,
                              status: 'DELIVERED',
                            })
                          }
                        >
                          Entregar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
