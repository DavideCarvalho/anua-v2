import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Users, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import {
  useExtraClassStudentsQueryOptions,
  type ExtraClassStudent,
} from '~/hooks/queries/use_extra_classes'
import { useCancelEnrollment } from '~/hooks/mutations/use_extra_class_mutations'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartao',
  PIX: 'PIX',
}

interface ExtraClassStudentsTableProps {
  extraClassId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExtraClassStudentsTable({
  extraClassId,
  open,
  onOpenChange,
}: ExtraClassStudentsTableProps) {
  const [page, setPage] = useState(1)
  const [cancelTarget, setCancelTarget] = useState<ExtraClassStudent | null>(null)

  const { data, isLoading } = useQuery({
    ...useExtraClassStudentsQueryOptions(extraClassId, { page }),
    enabled: open,
  })

  const cancelMutation = useCancelEnrollment()

  const handleCancel = () => {
    if (!cancelTarget) return
    cancelMutation.mutate(
      { extraClassId, enrollmentId: cancelTarget.id },
      {
        onSuccess: () => {
          toast.success('Inscricao cancelada')
          setCancelTarget(null)
        },
        onError: () => toast.error('Erro ao cancelar inscricao'),
      }
    )
  }

  const students = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alunos Inscritos
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum aluno inscrito nesta aula.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-center">Dia Venc.</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s: ExtraClassStudent) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.student?.user?.name ?? s.studentId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {PAYMENT_METHOD_LABELS[s.paymentMethod] ?? s.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{s.paymentDay}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setCancelTarget(s)}
                        >
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && meta.lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Pagina {meta.currentPage} de {meta.lastPage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.lastPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Proxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar inscricao?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao cancelara a inscricao de {cancelTarget?.student?.user?.name} e todas
              as parcelas futuras nao pagas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
