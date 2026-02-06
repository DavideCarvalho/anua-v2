import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Check, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useCreateExtraClassAttendance } from '~/hooks/mutations/use_extra_class_attendance_mutations'
import { useExtraClassStudentsQueryOptions } from '~/hooks/queries/use_extra_classes'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'

interface StudentAttendanceEntry {
  studentId: string
  studentName: string
  status: AttendanceStatus
  justification: string
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'PRESENT', label: 'Presente', color: 'bg-green-500' },
  { value: 'ABSENT', label: 'Ausente', color: 'bg-red-500' },
  { value: 'LATE', label: 'Atrasado', color: 'bg-yellow-500' },
  { value: 'JUSTIFIED', label: 'Justificado', color: 'bg-blue-500' },
]

interface ExtraClassAttendanceModalProps {
  extraClassId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExtraClassAttendanceModal({
  extraClassId,
  open,
  onOpenChange,
}: ExtraClassAttendanceModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState<StudentAttendanceEntry[]>([])
  const [initialized, setInitialized] = useState(false)

  const { data: studentsData, isLoading } = useQuery({
    ...useExtraClassStudentsQueryOptions(extraClassId, { limit: 100 }),
    enabled: open,
  })

  const createMutation = useCreateExtraClassAttendance()

  const students = studentsData?.data ?? []

  // Initialize entries when students load
  if (students.length > 0 && !initialized) {
    setEntries(
      students
        .filter((s) => !s.cancelledAt)
        .map((s) => ({
          studentId: s.studentId,
          studentName: s.student?.user?.name ?? s.studentId,
          status: 'PRESENT' as AttendanceStatus,
          justification: '',
        }))
    )
    setInitialized(true)
  }

  const updateEntry = (index: number, field: keyof StudentAttendanceEntry, value: string) => {
    setEntries((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const markAll = (status: AttendanceStatus) => {
    setEntries((prev) => prev.map((e) => ({ ...e, status })))
  }

  const handleSubmit = () => {
    if (entries.length === 0) return

    createMutation.mutate(
      {
        extraClassId,
        date,
        attendances: entries.map((e) => ({
          studentId: e.studentId,
          status: e.status,
          justification: e.justification || undefined,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Frequencia registrada')
          setInitialized(false)
          onOpenChange(false)
        },
        onError: () => toast.error('Erro ao registrar frequencia'),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setInitialized(false)
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lancar Frequencia</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data da Aula</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')}>
              <Check className="mr-1 h-3 w-3" />
              Todos Presentes
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')}>
              <X className="mr-1 h-3 w-3" />
              Todos Ausentes
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum aluno inscrito nesta aula.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead>Justificativa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={entry.studentId}>
                    <TableCell className="font-medium">{entry.studentName}</TableCell>
                    <TableCell>
                      <Select
                        value={entry.status}
                        onValueChange={(v) => updateEntry(index, 'status', v)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {(entry.status === 'ABSENT' || entry.status === 'JUSTIFIED') && (
                        <Input
                          placeholder="Motivo..."
                          value={entry.justification}
                          onChange={(e) => updateEntry(index, 'justification', e.target.value)}
                          className="h-8"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || entries.length === 0}
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Frequencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
