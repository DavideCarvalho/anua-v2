import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
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
  useExtraClassAttendanceSummaryQueryOptions,
  type AttendanceSummaryStudent,
} from '~/hooks/queries/use_extra_class_attendance'

function getAttendanceBadgeVariant(percentage: number) {
  if (percentage >= 75) return 'default' as const
  if (percentage >= 50) return 'secondary' as const
  return 'destructive' as const
}

interface ExtraClassAttendanceSummaryProps {
  extraClassId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExtraClassAttendanceSummary({
  extraClassId,
  open,
  onOpenChange,
}: ExtraClassAttendanceSummaryProps) {
  const { data, isLoading } = useQuery({
    ...useExtraClassAttendanceSummaryQueryOptions(extraClassId),
    enabled: open,
  })

  const students: AttendanceSummaryStudent[] = data?.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo de Frequencia
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Sem dados</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhuma frequencia registrada ainda.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead className="text-center">Presencas</TableHead>
                <TableHead className="text-center">Faltas</TableHead>
                <TableHead className="text-center">Atrasos</TableHead>
                <TableHead className="text-center">Justificado</TableHead>
                <TableHead className="text-center">Frequencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.studentId}>
                  <TableCell className="font-medium">{s.studentName}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="bg-green-500">
                      {s.presentCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">{s.absentCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{s.lateCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{s.justifiedCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      <Progress value={s.attendancePercentage} className="w-16 h-2" />
                      <Badge variant={getAttendanceBadgeVariant(s.attendancePercentage)}>
                        {s.attendancePercentage}%
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
