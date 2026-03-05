import { useQuery } from '@tanstack/react-query'
import { Calendar, User, Check, X, Utensils } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { Route } from '@tuyau/core/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

type CanteenMealReservationsResponse = Route.Response<'api.v1.canteen_meal_reservations.index'>

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
  SERVED: { label: 'Entregue', variant: 'outline' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
}

type MealReservation = CanteenMealReservationsResponse['data'][number]

export function MealReservationsTable({ canteenId, date }: MealReservationsTableProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.canteenMealReservations.index.queryOptions({
      query: { canteenId, date },
    })
  )
  const updateStatusMutation = useMutation(
    api.api.v1.canteenMealReservations.updateStatus.mutationOptions()
  )
  const cancelMutation = useMutation(api.api.v1.canteenMealReservations.cancel.mutationOptions())

  const reservations: MealReservation[] = data?.data ?? []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Carregando reservas...
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold">Não foi possível carregar as reservas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Tente novamente em instantes.'}
          </p>
        </CardContent>
      </Card>
    )
  }

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
            {reservations.map((reservation) => {
              const config = statusConfig[reservation.status] || statusConfig.PENDING

              return (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{reservation.student?.id || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      {reservation.meal?.name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.meal?.date
                      ? format(new Date(reservation.meal.date), 'dd/MM/yyyy', { locale: ptBR })
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
                              updateStatusMutation.mutate(
                                {
                                  params: { id: reservation.id },
                                  body: { status: 'CONFIRMED' },
                                },
                                {
                                  onSuccess: () =>
                                    queryClient.invalidateQueries({
                                      queryKey: ['canteen-meal-reservations'],
                                    }),
                                }
                              )
                            }
                            title="Confirmar"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              cancelMutation.mutate(
                                { params: { id: reservation.id } },
                                {
                                  onSuccess: () =>
                                    queryClient.invalidateQueries({
                                      queryKey: ['canteen-meal-reservations'],
                                    }),
                                }
                              )
                            }
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
                            updateStatusMutation.mutate(
                              {
                                params: { id: reservation.id },
                                body: { status: 'SERVED' },
                              },
                              {
                                onSuccess: () =>
                                  queryClient.invalidateQueries({
                                    queryKey: ['canteen-meal-reservations'],
                                  }),
                              }
                            )
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
