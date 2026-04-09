import { useMemo } from 'react'
import { Loader2, UserX } from 'lucide-react'
import { toast } from 'sonner'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import { pickCurrentEnrollment, type StudentEnrollmentSource } from '~/lib/current_enrollment'

interface CancelEnrollmentModalProps {
  studentId: string
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CancelEnrollmentModal({
  studentId,
  studentName,
  open,
  onOpenChange,
  onSuccess,
}: CancelEnrollmentModalProps) {
  const queryClient = useQueryClient()

  const { data: studentData, isLoading } = useQuery({
    ...api.api.v1.students.show.queryOptions({ params: { id: studentId } }),
    enabled: open && !!studentId,
  })

  const { data: academicPeriodsData } = useQuery(
    api.api.v1.academicPeriods.listAcademicPeriods.queryOptions({
      query: { limit: 100 },
    })
  )

  const cancelEnrollment = useMutation(api.api.v1.students.enrollments.cancel.mutationOptions())

  const enrollment = useMemo(() => {
    const student = studentData as StudentEnrollmentSource | undefined
    const periods = academicPeriodsData?.data ?? []
    return pickCurrentEnrollment(student, periods)
  }, [studentData, academicPeriodsData])

  async function handleCancelEnrollment() {
    if (!enrollment?.id) {
      toast.error('Matrícula não encontrada para este aluno')
      return
    }

    try {
      await cancelEnrollment.mutateAsync({
        params: { id: studentId, enrollmentId: enrollment.id },
      })
      queryClient.invalidateQueries({ queryKey: api.api.v1.students.index.pathKey() })
      toast.success('Matrícula cancelada com sucesso!')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar matrícula'
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar matrícula</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja cancelar a matrícula de <strong>{studentName}</strong>
            {enrollment?.class?.name ? ` na turma ${enrollment.class.name}` : ''}? As faturas
            futuras serão recalculadas automaticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelEnrollment.isPending}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelEnrollment}
            disabled={cancelEnrollment.isPending || isLoading || !enrollment?.id}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {cancelEnrollment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Confirmar cancelamento
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
