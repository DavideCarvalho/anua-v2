import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

const ABSENCE_REASON_LABELS: Record<string, string> = {
  SICKNESS: 'Doença',
  PERSONAL_MATTERS: 'Assuntos Pessoais',
  BLOOD_DONATION: 'Doação de Sangue',
  ELECTION_JUDGE: 'Mesário',
  VACATION: 'Férias',
  DAYOFF: 'Folga',
  OTHER: 'Outros',
}

const ABSENCE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
}

export function ViewAbsencesModal({
  open,
  onOpenChange,
  teacherId,
  month,
  year,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacherId: string | null
  month: number
  year: number
}) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [absenceToReject, setAbsenceToReject] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const approve = useMutation(api.api.v1.teachers.approveAbsence.mutationOptions())
  const reject = useMutation(api.api.v1.teachers.rejectAbsence.mutationOptions())

  const { data, isLoading } = useQuery({
    ...api.api.v1.teachers.getTeacherAbsences.queryOptions({
      query: { teacherId: teacherId ?? '', month, year },
    }),
    enabled: !!teacherId && open,
  })

  const absences = useMemo(() => {
    return data ?? []
  }, [data])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setRejectionReason('')
          setAbsenceToReject(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Faltas do Professor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : absences.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm">
              Nenhuma falta registrada para este período
            </p>
          ) : (
            <div className="space-y-4">
              {absences.map((absence: any) => (
                <div
                  key={absence.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{String(absence.date).slice(0, 10)}</p>
                      <Badge
                        variant={
                          absence.status === 'PENDING'
                            ? 'outline'
                            : absence.status === 'APPROVED'
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {ABSENCE_STATUS_LABELS[absence.status]}
                      </Badge>
                      {absence.isExcused && <Badge variant="outline">Falta Abonada</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Motivo: {ABSENCE_REASON_LABELS[absence.reason]}
                    </p>
                    {absence.description && (
                      <p className="text-muted-foreground text-sm">
                        Descrição: {absence.description}
                      </p>
                    )}
                    {absence.status === 'REJECTED' && absence.rejectionReason && (
                      <p className="text-muted-foreground text-sm">
                        Motivo da rejeição: {absence.rejectionReason}
                      </p>
                    )}

                    {absence.status === 'PENDING' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            toast.promise(
                              approve.mutateAsync({ body: { absenceId: absence.id } }).then(() =>
                                queryClient.invalidateQueries({
                                  queryKey: ['teacher-absences'],
                                })
                              ),
                              {
                                loading: 'Aprovando falta...',
                                error: 'Erro ao aprovar falta',
                                success: 'Falta aprovada com sucesso!',
                              }
                            )
                          }}
                        >
                          Aprovar
                        </Button>

                        {absenceToReject === absence.id ? (
                          <div className="flex flex-col gap-2">
                            <Textarea
                              placeholder="Motivo da rejeição"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (!rejectionReason) {
                                    toast.error('Informe o motivo da rejeição')
                                    return
                                  }

                                  toast.promise(
                                    reject
                                      .mutateAsync({
                                        body: {
                                          absenceId: absence.id,
                                          rejectionReason,
                                        },
                                      })
                                      .then(() =>
                                        queryClient.invalidateQueries({
                                          queryKey: ['teacher-absences'],
                                        })
                                      ),
                                    {
                                      loading: 'Rejeitando falta...',
                                      error: 'Erro ao rejeitar falta',
                                      success: 'Falta rejeitada com sucesso!',
                                    }
                                  )
                                  setRejectionReason('')
                                  setAbsenceToReject(null)
                                }}
                              >
                                Confirmar Rejeição
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAbsenceToReject(null)
                                  setRejectionReason('')
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAbsenceToReject(absence.id)}
                          >
                            Rejeitar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
